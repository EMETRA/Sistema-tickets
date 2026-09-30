import type { CodigoErrorNoticiaCms } from './types';

const CODIGOS: readonly CodigoErrorNoticiaCms[] = [
    'VALIDATION_ERROR',
    'INTERNAL_UNAUTHORIZED',
    'NEWS_NOT_FOUND',
    'SLUG_IDIOMA_CONFLICT',
    'NEWS_NOT_PUBLISHABLE',
    'PUBLISH_TRANSACTION_FAILED',
];

const esCodigo = (value: unknown): value is CodigoErrorNoticiaCms =>
    typeof value === 'string' && (CODIGOS as readonly string[]).includes(value);

/**
 * Error de la API de noticias. `codigo` es null cuando no se reconoce (red, timeout, etc.).
 * Cuerpo de backend (README): { statusCode, error, message: [] }.
 */
export class NoticiaCmsError extends Error {
    readonly codigo: CodigoErrorNoticiaCms | null;
    readonly statusCode: number | null;
    readonly mensajes: string[];

    constructor(codigo: CodigoErrorNoticiaCms | null, statusCode: number | null, mensajes: string[] = []) {
        super(mensajes[0] ?? codigo ?? 'Error al guardar la noticia');
        this.name = 'NoticiaCmsError';
        this.codigo = codigo;
        this.statusCode = statusCode;
        this.mensajes = mensajes;
    }
}

type Registro = Record<string, unknown>;
const esRegistro = (value: unknown): value is Registro => typeof value === 'object' && value !== null;

/**
 * Convierte cualquier error del guardado en NoticiaCmsError.
 * TODO [COM03-BACKEND]: confirmar cómo api-tickets entrega el error por GraphQL. Se aceptan:
 *   - el cuerpo del README ({ statusCode, error, message }) dentro de `errors[0].extensions`
 *     (o `extensions.response`), si el error trae `graphQLErrors`;
 *   - el código como `extensions.code`.
 * Hoy graphqlRequestClient solo conserva el mensaje (no las extensions): cuando se conecte la
 * mutación hay que exponerlas para leer el código.
 */
export function toNoticiaCmsError(error: unknown): NoticiaCmsError {
    if (error instanceof NoticiaCmsError) return error;

    const graphQLErrors = esRegistro(error) && Array.isArray(error.graphQLErrors) ? error.graphQLErrors : [];
    const extensions = esRegistro(graphQLErrors[0]) && esRegistro(graphQLErrors[0].extensions)
        ? graphQLErrors[0].extensions
        : null;
    const cuerpo = extensions && esRegistro(extensions.response) ? extensions.response : extensions;

    if (cuerpo) {
        const codigo = [cuerpo.error, cuerpo.code, extensions?.code].find(esCodigo) ?? null;
        const statusCode = typeof cuerpo.statusCode === 'number' ? cuerpo.statusCode : null;
        const mensajes = Array.isArray(cuerpo.message)
            ? cuerpo.message.filter((m): m is string => typeof m === 'string')
            : typeof cuerpo.message === 'string' ? [cuerpo.message] : [];
        if (codigo) return new NoticiaCmsError(codigo, statusCode, mensajes);
    }

    const mensaje = error instanceof Error ? error.message : String(error);
    return new NoticiaCmsError(null, null, [mensaje]);
}
