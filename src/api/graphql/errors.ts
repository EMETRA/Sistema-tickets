import { ERROR_MESSAGES } from '@/config/constants';

/**
 * Interfaz de extensiones de error GraphQL
 */
export interface GraphQLErrorExtensions {
  code?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Interfaz de error GraphQL
 */
export interface GraphQLErrorData {
  message?: string;
  extensions?: GraphQLErrorExtensions;
  path?: (string | number)[];
  locations?: Array<{ line: number; column: number }>;
}

/**
 * Interfaz de error de red
 */
export interface NetworkErrorData {
  statusCode?: number;
  message?: string;
  code?: string;
  [key: string]: string | number | undefined;
}

/**
 * Tipos de error
 */
export enum ErrorType {
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Clase personalizada para errores de GraphQL
 */
export class GraphQLClientError extends Error {
    type: ErrorType;
    statusCode?: number;
    originalError?: unknown;

    constructor(
        type: ErrorType,
        message: string,
        statusCode?: number,
        originalError?: unknown
    ) {
        super(message);
        this.name = 'GraphQLClientError';
        this.type = type;
        this.statusCode = statusCode;
        this.originalError = originalError;
    }
}

/**
 * Manejador de errores
 */
export class ErrorHandler {
    /**
   * Determinar tipo de error
   */
    static getErrorType(error: unknown): ErrorType {
    // Validar que sea un objeto Error
        if (!(error instanceof Error) && typeof error !== 'object') {
            return ErrorType.UNKNOWN_ERROR;
        }

        const err = error as Record<string, unknown> | Error;

        // Error de autenticación (401)
        if ('statusCode' in err) {
            const statusCode = err.statusCode;
            if (statusCode === 401 || (typeof statusCode === 'string' && statusCode === '401')) {
                return ErrorType.AUTH_ERROR;
            }
            if (statusCode === 403 || (typeof statusCode === 'string' && statusCode === '403')) {
                return ErrorType.VALIDATION_ERROR;
            }
            if (statusCode === 404 || (typeof statusCode === 'string' && statusCode === '404')) {
                return ErrorType.NOT_FOUND_ERROR;
            }
        }

        // Error GraphQL
        if ('graphQLErrors' in err && Array.isArray(err.graphQLErrors)) {
            return ErrorType.GRAPHQL_ERROR;
        }

        // Error de timeout
        if (
            err instanceof Error &&
      (err.name === 'AbortError' ||
        err.message?.toLowerCase().includes('timeout') ||
        err.message?.toLowerCase().includes('abort'))
        ) {
            return ErrorType.TIMEOUT_ERROR;
        }

        // Error de conexión/red
        if (
            err instanceof Error &&
      (err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.name === 'TypeError')
        ) {
            return ErrorType.NETWORK_ERROR;
        }

        // Error con extensions.code de GraphQL
        if ('extensions' in err && typeof err.extensions === 'object' && err.extensions !== null) {
            const ext = err.extensions as Record<string, unknown>;
            if (ext.code === 'UNAUTHENTICATED') {
                return ErrorType.AUTH_ERROR;
            }
            if (ext.code === 'FORBIDDEN') {
                return ErrorType.VALIDATION_ERROR;
            }
        }

        return ErrorType.UNKNOWN_ERROR;
    }

    /**
   * Obtener mensaje de error humanizado
   */
    static getUserMessage(error: unknown): string {
    // Si el error ya tiene un mensaje personalizado
        if (typeof error === 'object' && error !== null && 'userMessage' in error) {
            const userMsg = (error as Record<string, unknown>).userMessage;
            if (typeof userMsg === 'string') {
                return userMsg;
            }
        }

        const type = this.getErrorType(error);

        switch (type) {
        case ErrorType.AUTH_ERROR:
            return ERROR_MESSAGES.UNAUTHORIZED;

        case ErrorType.NOT_FOUND_ERROR:
            return ERROR_MESSAGES.NOT_FOUND;

        case ErrorType.VALIDATION_ERROR:
            return ERROR_MESSAGES.FORBIDDEN;

        case ErrorType.TIMEOUT_ERROR:
            return 'La solicitud tardó demasiado. Intenta nuevamente.';

        case ErrorType.GRAPHQL_ERROR:
        // Intentar obtener el primer mensaje de error GraphQL
            if (
                typeof error === 'object' &&
          error !== null &&
          'graphQLErrors' in error &&
          Array.isArray((error as Record<string, unknown>).graphQLErrors)
            ) {
                const graphQLErrors = (error as Record<string, unknown>).graphQLErrors as Array<{
            message?: string;
          }>;
                if (graphQLErrors.length > 0 && graphQLErrors[0]?.message) {
                    return graphQLErrors[0].message;
                }
            }
            return ERROR_MESSAGES.SERVER_ERROR;

        case ErrorType.NETWORK_ERROR:
            if (typeof error === 'object' && error !== null) {
                const err = error as Record<string, unknown>;
                if (err.code === 'ECONNREFUSED') {
                    return 'No se puede conectar con el servidor.';
                }
            }
            return ERROR_MESSAGES.NETWORK_ERROR;

        default:
            if (error instanceof Error) {
                return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
            }
            return ERROR_MESSAGES.UNKNOWN_ERROR;
        }
    }

    /**
   * Verificar si es error de autenticación
   */
    static isAuthError(error: unknown): boolean {
        return this.getErrorType(error) === ErrorType.AUTH_ERROR;
    }

    /**
   * Verificar si es error de validación
   */
    static isValidationError(error: unknown): boolean {
        return this.getErrorType(error) === ErrorType.VALIDATION_ERROR;
    }

    /**
   * Verificar si es error de red
   */
    static isNetworkError(error: unknown): boolean {
        return this.getErrorType(error) === ErrorType.NETWORK_ERROR;
    }

    /**
   * Verificar si es error de timeout
   */
    static isTimeoutError(error: unknown): boolean {
        return this.getErrorType(error) === ErrorType.TIMEOUT_ERROR;
    }

    /**
   * Loguear error detallado (solo en desarrollo)
   */
    static log(error: unknown, context: string = ''): void {
        if (typeof window === 'undefined') return;

        const isDev = process.env.NEXT_PUBLIC_ENV === 'development';
        if (!isDev) return;

        console.group(`[GraphQL Error] ${context}`);
        console.error('Type:', this.getErrorType(error));
        console.error('Message:', this.getUserMessage(error));
        console.error('Original:', error);
        console.groupEnd();
    }

    /**
   * Crear error personalizado
   */
    static createError(
        type: ErrorType,
        userMessage: string,
        originalError?: unknown
    ): GraphQLClientError {
        const statusCode =
      typeof originalError === 'object' &&
      originalError !== null &&
      'statusCode' in originalError
          ? (originalError as Record<string, unknown>).statusCode
          : undefined;

        return new GraphQLClientError(
            type,
            userMessage,
            typeof statusCode === 'number' ? statusCode : undefined,
            originalError
        );
    }
}
