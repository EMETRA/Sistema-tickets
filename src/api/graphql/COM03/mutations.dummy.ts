import type {
    GuardarNoticiaCmsResponse,
    GuardarNoticiaCmsResult,
    GuardarNoticiaCmsVariables,
} from './types';

/**
 * TODO [COM03-BACKEND]: simulación de las mutaciones mientras no exista la API.
 * Eliminar este archivo cuando los hooks llamen a graphqlRequestClient.
 *
 * Cambiar SIMULAR_ERROR a true para probar las pantallas y mensajes de error.
 */
export const SIMULAR_ERROR = false;

/**
 * Guardado (`guardarNoticiaCms`): false = API real (api-tickets); true = esta simulación, para
 * probar el flujo sin backend. Archivar y restaurar también lo usan (van por el mismo guardado).
 */
// TODO [COM03-BACKEND]: pasar a false cuando NEXT_PUBLIC_GRAPHQL_ENDPOINT apunte a api-tickets con
// guardarNoticiaCms desplegada (decisión del usuario, 2026-10-06).
export const USAR_SIMULACION = false;

/**
 * Errores de `guardarNoticiaCms` según la tabla del README "Noticias CMS" (sección 5):
 * estado real y mensaje, tal como llegan en `extensions.originalError`.
 */
const ERRORES_README = {
    SIN_TOKEN: { statusCode: 401, message: 'Token Bearer requerido' },
    TOKEN_VENCIDO: { statusCode: 401, message: 'Token inválido o expirado' },
    SIN_PERMISO_EDITAR: { statusCode: 403, message: 'No tiene el permiso requerido: VIVI_NOTICIAS_EDITAR' },
    SIN_PERMISO_PUBLICAR: { statusCode: 403, message: 'No tiene el permiso requerido: VIVI_NOTICIAS_PUBLICAR' },
    CLAVE_INVALIDA: { statusCode: 400, message: 'claveIdempotente es requerida (1 a 64 caracteres)' },
    FALTAN_SLUG_TITULO: { statusCode: 400, message: 'Al crear, slug y titulo son obligatorios' },
    IDEMPOTENCY_CONFLICT: { statusCode: 409, message: 'IDEMPOTENCY_CONFLICT' },
    SLUG_IDIOMA_CONFLICT: { statusCode: 409, message: 'SLUG_IDIOMA_CONFLICT' },
    NEWS_NOT_FOUND: { statusCode: 404, message: 'NEWS_NOT_FOUND' },
    PORTAL_NO_CONFIGURADO: { statusCode: 503, message: 'API_PORTAL_URL o API_PORTAL_INTERNAL_KEY no configuradas' },
    PORTAL_NO_RESPONDE: { statusCode: 502, message: 'No se pudo contactar api-portal: ECONNREFUSED' },
} as const;

/**
 * Simula uno de los errores del README al guardar (p. ej. 'SIN_PERMISO_PUBLICAR').
 * null = no simular. SIMULAR_ERROR = true simula un error de red (sin código ni estado).
 */
export const SIMULAR_ERROR_GUARDAR: keyof typeof ERRORES_README | null = null;

/**
 * Error con la misma forma que lanza graphqlRequestClient (Error + `graphQLErrors`), para que la
 * simulación pase por el mismo lector de errores que la API real (toNoticiaCmsError).
 */
function errorGraphQL({ statusCode, message }: { statusCode: number; message: string }) {
    return Object.assign(new Error(message), {
        graphQLErrors: [{ message, extensions: { originalError: { statusCode, message } } }],
    });
}

const DEMORA_MS = 1500;

const esperar = () => new Promise((resolve) => setTimeout(resolve, DEMORA_MS));

/** Por clave: el contenido que se guardó con ella y su resultado. */
const intentosPorClave = new Map<string, { contenido: string; resultado: GuardarNoticiaCmsResult }>();
let siguienteId = 100;

/**
 * Imita `guardarNoticiaCms` según el README "Noticias CMS" (2026-10-06):
 * - Queda "publicada" (visible, con `publicacion`) solo si estado = publicada, visibilidad = publica
 *   y la fecha está vacía o ya pasó. Si no, "guardada" y `publicacion: null`.
 * - Misma clave y mismo contenido: responde igual, con `idempotente: true`.
 * - Misma clave y contenido distinto: 409 IDEMPOTENCY_CONFLICT.
 */
export async function simularGuardarNoticiaCms(
    { input }: GuardarNoticiaCmsVariables
): Promise<GuardarNoticiaCmsResponse> {
    const { claveIdempotente } = input;
    await esperar();
    if (SIMULAR_ERROR_GUARDAR) {
        throw errorGraphQL(ERRORES_README[SIMULAR_ERROR_GUARDAR]);
    }
    if (SIMULAR_ERROR) {
        throw new Error("Error simulado (COM03 dummy)");
    }

    const contenido = JSON.stringify({ ...input, claveIdempotente: undefined });
    const previo = intentosPorClave.get(claveIdempotente);
    if (previo && previo.contenido !== contenido) {
        throw errorGraphQL(ERRORES_README.IDEMPOTENCY_CONFLICT);
    }
    if (previo) {
        return { guardarNoticiaCms: { ...previo.resultado, idempotente: true } };
    }

    const fecha = input.fechaPublicacion ?? null;
    const visible = input.estado === 'publicada'
        && input.visibilidad === 'publica'
        && (!fecha || new Date(fecha).getTime() <= Date.now());
    const id = input.id ?? siguienteId++;

    const resultado: GuardarNoticiaCmsResult = {
        resultado: visible ? 'publicada' : 'guardada',
        idempotente: false,
        noticia: {
            id,
            slug: input.slug,
            idioma: input.idioma,
            estado: input.estado,
            visibilidad: input.visibilidad,
            fechaPublicacion: fecha,
        },
        publicacion: visible
            ? { idNoticia: id, version: 1, claveIdempotente, idEvento: 9000 + id, idUsuario: 0 }
            : null,
    };
    intentosPorClave.set(claveIdempotente, { contenido, resultado });
    return { guardarNoticiaCms: resultado };
}
