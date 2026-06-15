import { ERROR_MESSAGES } from '@/config/constants';
import { ClientError } from 'graphql-request';

/**
 * Tipos de error que podemos identificar
 */
export enum ErrorType {
  AUTH_ERROR = 'AUTH_ERROR',
  FORBIDDEN_ERROR = 'FORBIDDEN_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Interfaz para información detallada del error
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  statusCode?: number;
  originalError?: unknown;
  graphQLErrors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
}

/**
 * Clase personalizada para errores normalizados
 */
export class AppError extends Error {
    type: ErrorType;
    statusCode?: number;
    graphQLErrors?: Array<{ message: string; extensions?: Record<string, unknown> }>;
    originalError?: unknown;

    constructor(info: ErrorInfo) {
        super(info.message);
        this.name = 'AppError';
        this.type = info.type;
        this.statusCode = info.statusCode;
        this.graphQLErrors = info.graphQLErrors;
        this.originalError = info.originalError;
    }
}

/**
 * Manejador centralizado de errores de GraphQL
 * 
 * Maneja los errores que vienen de graphql-request de forma segura y predecible.
 * Esto incluye:
 * - Errores GraphQL (invallidaciones, autenticación, etc.)
 * - Errores de red (conexión, timeout, etc.)
 * - Errores HTTP (401, 403, 404, 500, etc.)
 */
export class ErrorHandler {
    /**
     * Verificar si el error es un ClientError de graphql-request
     */
    private static isClientError(error: unknown): error is ClientError {
        return error instanceof ClientError;
    }

    /**
     * Extraer los errores GraphQL del ClientError
     */
    private static extractGraphQLErrors(error: ClientError): Array<{ message: string; extensions?: Record<string, unknown> }> | undefined {
        // graphql-request v7 puede poner los errores en dos lugares:
        // 1. error.response.data.errors (cuando hay respuesta parcial)
        // 2. error.response.errors (cuando no hay datos)
        try {
            let errors: unknown[] | undefined;

            // Primero intenta response.errors (caso más común)
            if (Array.isArray(error.response?.errors)) {
                errors = error.response.errors;
            } else {
                // Luego intenta response.data.errors
                const data = error.response?.data;
                if (data && typeof data === 'object') {
                    const errorsInData = (data as Record<string, unknown>).errors;
                    if (Array.isArray(errorsInData)) {
                        errors = errorsInData;
                    }
                }
            }

            if (!errors || errors.length === 0) {
                return undefined;
            }

            return errors.map((err: unknown) => {
                if (typeof err === 'object' && err !== null) {
                    const errObj = err as Record<string, unknown>;
                    return {
                        message: (errObj.message as string) || 'Error desconocido',
                        extensions: (errObj.extensions as Record<string, unknown>) || undefined,
                    };
                }
                return { message: 'Error desconocido' };
            });
        } catch {
            return undefined;
        }
    }

    /**
     * Obtener el código del error GraphQL (si está disponible)
     */
    private static getGraphQLErrorCode(graphQLErrors?: Array<{ message: string; extensions?: Record<string, unknown> }>): string | undefined {
        if (!graphQLErrors || graphQLErrors.length === 0) return undefined;
        const firstError = graphQLErrors[0];
        if (firstError.extensions && typeof firstError.extensions === 'object') {
            return (firstError.extensions.code as string) || undefined;
        }
        return undefined;
    }

    /**
     * Extraer statusCode de originalError en extensions (usado por NestJS/Apollo)
     */
    private static getStatusCodeFromExtensions(graphQLErrors?: Array<{ message: string; extensions?: Record<string, unknown> }>): number | undefined {
        if (!graphQLErrors || graphQLErrors.length === 0) return undefined;
        const firstError = graphQLErrors[0];
        if (firstError.extensions && typeof firstError.extensions === 'object') {
            const originalError = firstError.extensions.originalError;
            if (originalError && typeof originalError === 'object') {
                const statusCode = (originalError as Record<string, unknown>).statusCode;
                if (typeof statusCode === 'number') {
                    return statusCode;
                }
            }
        }
        return undefined;
    }

    /**
     * Determinar el tipo de error basado en el código HTTP y contexto
     */
    private static determineErrorType(error: unknown): ErrorType {
        // Error de timeout (AbortError)
        if (error instanceof Error && error.name === 'AbortError') {
            return ErrorType.TIMEOUT_ERROR;
        }

        // Cliente error de graphql-request
        if (this.isClientError(error)) {
            // PRIMERO: Chequear errores GraphQL (tienen prioridad sobre HTTP status)
            const graphQLErrors = this.extractGraphQLErrors(error);
            const errorCode = this.getGraphQLErrorCode(graphQLErrors);

            if (errorCode === 'UNAUTHENTICATED') {
                return ErrorType.AUTH_ERROR;
            }
            if (errorCode === 'FORBIDDEN') {
                return ErrorType.FORBIDDEN_ERROR;
            }
            if (errorCode === 'VALIDATION_ERROR' || errorCode === 'BAD_REQUEST' || errorCode === 'BAD_USER_INPUT') {
                return ErrorType.VALIDATION_ERROR;
            }
            if (errorCode === 'INTERNAL_SERVER_ERROR') {
                return ErrorType.GRAPHQL_ERROR;
            }

            // Si hay errores GraphQL genéricos, es un error de GraphQL
            if (graphQLErrors && graphQLErrors.length > 0) {
                return ErrorType.GRAPHQL_ERROR;
            }

            // SEGUNDO: Chequear status HTTP (solo si no hay errores GraphQL)
            const status = error.response?.status;
            
            if (status === 401) {
                return ErrorType.AUTH_ERROR;
            }
            if (status === 403) {
                return ErrorType.FORBIDDEN_ERROR;
            }
            if (status === 404) {
                return ErrorType.NOT_FOUND_ERROR;
            }
            if (status && status >= 400 && status < 500) {
                return ErrorType.VALIDATION_ERROR;
            }
            if (status === 500) {
                return ErrorType.GRAPHQL_ERROR;
            }

            // Error desconocido de ClientError
            return ErrorType.UNKNOWN_ERROR;
        }

        // Error de red normal
        if (error instanceof TypeError) {
            if (error.message.includes('fetch') || error.message.includes('network')) {
                return ErrorType.NETWORK_ERROR;
            }
        }

        // Error del servidor (Error genérico)
        if (error instanceof Error) {
            return ErrorType.UNKNOWN_ERROR;
        }

        return ErrorType.UNKNOWN_ERROR;
    }

    /**
     * Obtener mensaje de error humanizado
     * 
     * @param error El error capturado
     * @returns Un mensaje amigable para mostrar al usuario
     */
    static getUserMessage(error: unknown): string {
        const type = this.determineErrorType(error);

        // Intentar obtener mensaje personalizado del ClientError
        if (this.isClientError(error)) {
            const graphQLErrors = this.extractGraphQLErrors(error);
            
            // Si hay errores GraphQL, usar el primer mensaje
            if (graphQLErrors && graphQLErrors.length > 0) {
                return graphQLErrors[0].message;
            }

            // Usar el mensaje del ClientError si existe
            if (error.message) {
                return error.message;
            }
        }

        // Mensajes por tipo de error
        switch (type) {
        case ErrorType.AUTH_ERROR:
            return ERROR_MESSAGES.UNAUTHORIZED || 'Las credenciales son inválidas.';

        case ErrorType.FORBIDDEN_ERROR:
            return 'No tienes permiso para acceder a este recurso.';

        case ErrorType.NOT_FOUND_ERROR:
            return ERROR_MESSAGES.NOT_FOUND || 'El recurso no fue encontrado.';

        case ErrorType.VALIDATION_ERROR:
            return ERROR_MESSAGES.FORBIDDEN || 'Los datos proporcionados no son válidos.';

        case ErrorType.TIMEOUT_ERROR:
            return 'La solicitud tardó demasiado tiempo. Intenta nuevamente.';

        case ErrorType.NETWORK_ERROR:
            return ERROR_MESSAGES.NETWORK_ERROR || 'No se puede conectar con el servidor.';

        case ErrorType.GRAPHQL_ERROR:
            return ERROR_MESSAGES.SERVER_ERROR || 'Error al procesar tu solicitud.';

        case ErrorType.UNKNOWN_ERROR:
        default:
            if (error instanceof Error) {
                return error.message || ERROR_MESSAGES.UNKNOWN_ERROR || 'Ocurrió un error inesperado.';
            }
            return ERROR_MESSAGES.UNKNOWN_ERROR || 'Ocurrió un error inesperado.';
        }
    }

    /**
     * Identificar y normalizar el error
     * 
     * @param error El error capturado
     * @returns Información normalizada del error
     */
    static parseError(error: unknown): ErrorInfo {
        const type = this.determineErrorType(error);
        const message = this.getUserMessage(error);
        const info: ErrorInfo = {
            type,
            message,
            originalError: error,
        };

        if (this.isClientError(error)) {
            const graphQLErrors = this.extractGraphQLErrors(error);
            info.graphQLErrors = graphQLErrors;
            
            // Prioridad: statusCode del response HTTP > statusCode en extensions.originalError
            if (error.response?.status) {
                info.statusCode = error.response.status;
            } else {
                // Si no hay status HTTP, intentar extraer desde extensions.originalError.statusCode
                const statusFromExtensions = this.getStatusCodeFromExtensions(graphQLErrors);
                if (statusFromExtensions) {
                    info.statusCode = statusFromExtensions;
                }
            }
        } else if (error instanceof Error && error.name === 'AbortError') {
            info.statusCode = 408; // Request Timeout
        }

        return info;
    }

    /**
     * Verificar si es error de autenticación
     */
    static isAuthError(error: unknown): boolean {
        return this.determineErrorType(error) === ErrorType.AUTH_ERROR;
    }

    /**
     * Verificar si es error de validación
     */
    static isValidationError(error: unknown): boolean {
        return this.determineErrorType(error) === ErrorType.VALIDATION_ERROR;
    }

    /**
     * Verificar si es error de red
     */
    static isNetworkError(error: unknown): boolean {
        return this.determineErrorType(error) === ErrorType.NETWORK_ERROR;
    }

    /**
     * Verificar si es error de timeout
     */
    static isTimeoutError(error: unknown): boolean {
        return this.determineErrorType(error) === ErrorType.TIMEOUT_ERROR;
    }

    /**
     * Verificar si es error GraphQL
     */
    static isGraphQLError(error: unknown): boolean {
        return this.determineErrorType(error) === ErrorType.GRAPHQL_ERROR;
    }

    /**
     * Loguear error detallado (solo en desarrollo)
     */
    static log(error: unknown, context: string = ''): void {
        // No loguear en servidor
        if (typeof window === 'undefined') return;

        // Solo en desarrollo
        const isDev = process.env.NEXT_PUBLIC_ENV === 'development' || process.env.NODE_ENV === 'development';
        if (!isDev) return;

        const errorInfo = this.parseError(error);

        console.group(`❌ [GraphQL Error] ${context}`);
        console.log('Tipo:', errorInfo.type);
        console.log('Mensaje:', errorInfo.message);
        console.log('Status:', errorInfo.statusCode);
        
        if (errorInfo.graphQLErrors) {
            console.table(errorInfo.graphQLErrors);
        }
        
        console.log('Error original:', errorInfo.originalError);
        console.groupEnd();
    }

    /**
     * Crear un AppError normalizado
     */
    static createAppError(
        type: ErrorType,
        message: string,
        statusCode?: number,
        originalError?: unknown
    ): AppError {
        return new AppError({
            type,
            message,
            statusCode,
            originalError,
        });
    }
}
