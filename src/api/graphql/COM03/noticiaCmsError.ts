import type { CodigoErrorNoticiaCms } from './types';

const CODIGOS: readonly CodigoErrorNoticiaCms[] = [
    'SLUG_IDIOMA_CONFLICT',
    'IDEMPOTENCY_CONFLICT',
    'NEWS_NOT_FOUND',
];

/** Permisos del README ("Noticias CMS", sección 2), p. ej. VIVI_NOTICIAS_PUBLICAR. */
const PERMISO = /\bVIVI_[A-Z_]+\b/;

/**
 * Error de la API de noticias.
 * - `codigo`: SLUG_IDIOMA_CONFLICT, IDEMPOTENCY_CONFLICT o NEWS_NOT_FOUND; null si no trae uno.
 * - `statusCode`: estado real del error (README: `errors[].extensions.originalError.statusCode`);
 *   null si no llegó (red, timeout).
 * - `permisoFaltante`: en un 403, el permiso que nombra el mensaje (p. ej. VIVI_NOTICIAS_PUBLICAR).
 */
export class NoticiaCmsError extends Error {
    readonly codigo: CodigoErrorNoticiaCms | null;
    readonly statusCode: number | null;
    readonly mensajes: string[];
    readonly permisoFaltante: string | null;

    constructor(codigo: CodigoErrorNoticiaCms | null, statusCode: number | null, mensajes: string[] = []) {
        super(mensajes[0] ?? codigo ?? 'Error al guardar la noticia');
        this.name = 'NoticiaCmsError';
        this.codigo = codigo;
        this.statusCode = statusCode;
        this.mensajes = mensajes;
        this.permisoFaltante = statusCode === 403
            ? mensajes.map((m) => PERMISO.exec(m)?.[0]).find(Boolean) ?? null
            : null;
    }
}

type Registro = Record<string, unknown>;
const esRegistro = (value: unknown): value is Registro => typeof value === 'object' && value !== null;

/** `message` del cuerpo de error: texto o arreglo de textos. */
const aTextos = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.filter((m): m is string => typeof m === 'string');
    return [];
};

/**
 * `extensions.code` de Nest/Apollo → estado HTTP, cuando el error no trae `statusCode`
 * (ERRORES_API.md, sección 1).
 */
const ESTADO_POR_CODIGO_APOLLO: Record<string, number> = {
    BAD_REQUEST: 400,
    BAD_USER_INPUT: 400,
    UNAUTHENTICATED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
};

/** Busca un código conocido: valor exacto o contenido en un texto ("409 SLUG_IDIOMA_CONFLICT"). */
const buscarCodigo = (textos: string[]): CodigoErrorNoticiaCms | null =>
    CODIGOS.find((codigo) => textos.some((texto) => texto === codigo || texto.includes(codigo))) ?? null;

/**
 * Convierte cualquier error del guardado en NoticiaCmsError.
 * README "Noticias CMS" (sección 5): GraphQL suele responder HTTP 200 con `errors`, y el estado
 * real va en `errors[].extensions.originalError.statusCode`. Se lee de `graphQLErrors`, que
 * graphqlRequestClient conserva en el error que lanza.
 * Del cuerpo se toman `statusCode`, `message` (texto o arreglo) y `error`. También se acepta
 * `extensions.response`. Si no hay `statusCode`, se deduce de `extensions.code`
 * (ERRORES_API.md, sección 1: "no asumas que todos los errores tienen el mismo `extensions`").
 */
export function toNoticiaCmsError(error: unknown): NoticiaCmsError {
    if (error instanceof NoticiaCmsError) return error;

    const mensajeError = error instanceof Error ? error.message : String(error);
    if (esRegistro(error) && typeof error.statusCode === 'number') {
        const body = esRegistro(error.body) ? error.body : {};
        const mensajes = aTextos(body.message);
        return new NoticiaCmsError(buscarCodigo([...aTextos(body.error), ...mensajes]), error.statusCode, mensajes.length ? mensajes : [mensajeError]);
    }
    const graphQLErrors = esRegistro(error) && Array.isArray(error.graphQLErrors) ? error.graphQLErrors : [];
    const primero = esRegistro(graphQLErrors[0]) ? graphQLErrors[0] : null;
    const extensions = primero && esRegistro(primero.extensions) ? primero.extensions : null;

    // graphqlRequestClient lanza Error('Unauthorized') cuando la respuesta HTTP es 401.
    if (!extensions) {
        return new NoticiaCmsError(null, mensajeError === 'Unauthorized' ? 401 : null, [mensajeError]);
    }

    const cuerpo = esRegistro(extensions.originalError)
        ? extensions.originalError
        : esRegistro(extensions.response) ? extensions.response : extensions;

    const codigoApollo = typeof extensions.code === 'string' ? extensions.code : '';
    const statusCode = typeof cuerpo.statusCode === 'number'
        ? cuerpo.statusCode
        : typeof extensions.statusCode === 'number'
            ? extensions.statusCode
            : ESTADO_POR_CODIGO_APOLLO[codigoApollo] ?? null;
    const mensajes = aTextos(cuerpo.message);
    const textos = [
        ...aTextos(cuerpo.error),
        ...mensajes,
        ...aTextos(extensions.code),
        ...aTextos(primero?.message),
    ];

    return new NoticiaCmsError(
        buscarCodigo(textos),
        statusCode,
        mensajes.length > 0 ? mensajes : aTextos(primero?.message),
    );
}
