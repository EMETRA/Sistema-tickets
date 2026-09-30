import { NoticiaCmsError } from './noticiaCmsError';
import type {
    CodigoErrorNoticiaCms,
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
 * Simula un error de `guardarNoticiaCms` con un código del README (p. ej. 'SLUG_IDIOMA_CONFLICT').
 * null = no simular. SIMULAR_ERROR = true simula un error sin código (red, timeout).
 */
export const SIMULAR_ERROR_GUARDAR: CodigoErrorNoticiaCms | null = null;

const DEMORA_MS = 1500;

const STATUS_POR_CODIGO: Record<CodigoErrorNoticiaCms, number> = {
    VALIDATION_ERROR: 400,
    INTERNAL_UNAUTHORIZED: 401,
    NEWS_NOT_FOUND: 404,
    SLUG_IDIOMA_CONFLICT: 409,
    NEWS_NOT_PUBLISHABLE: 409,
    PUBLISH_TRANSACTION_FAILED: 500,
};

const esperar = () => new Promise((resolve) => setTimeout(resolve, DEMORA_MS));

export async function simularMutacion<T>(respuesta: T): Promise<T> {
    await esperar();
    if (SIMULAR_ERROR) {
        throw new Error("Error simulado (COM03 dummy)");
    }
    return respuesta;
}

/** Resultados por clave, para responder `idempotente: true` si se repite la clave. */
const resultadosPorClave = new Map<string, GuardarNoticiaCmsResult>();
let siguienteId = 100;

/**
 * Imita `guardarNoticiaCms` según el README:
 * - Queda "publicada" (visible, con `publicacion`) solo si estado = publicada, visibilidad = publica
 *   y la fecha está vacía o ya pasó. Si no, "guardada" y `publicacion: null`.
 * - La misma clave por segunda vez responde igual, con `idempotente: true`.
 */
export async function simularGuardarNoticiaCms(
    { claveIdempotente, noticia }: GuardarNoticiaCmsVariables
): Promise<GuardarNoticiaCmsResponse> {
    await esperar();
    if (SIMULAR_ERROR_GUARDAR) {
        throw new NoticiaCmsError(SIMULAR_ERROR_GUARDAR, STATUS_POR_CODIGO[SIMULAR_ERROR_GUARDAR], [
            `Error simulado: ${SIMULAR_ERROR_GUARDAR}`,
        ]);
    }
    if (SIMULAR_ERROR) {
        throw new Error("Error simulado (COM03 dummy)");
    }

    const previo = resultadosPorClave.get(claveIdempotente);
    if (previo) {
        return { guardarNoticiaCms: { ...previo, idempotente: true } };
    }

    const fecha = noticia.fecha_publicacion ?? null;
    const visible = noticia.estado === 'publicada'
        && noticia.visibilidad !== 'privada'
        && (!fecha || new Date(fecha).getTime() <= Date.now());
    const id = noticia.id ?? siguienteId++;

    const resultado: GuardarNoticiaCmsResult = {
        resultado: visible ? 'publicada' : 'guardada',
        idempotente: false,
        noticia: {
            id,
            slug: noticia.slug,
            idioma: noticia.idioma ?? 'es-GT',
            estado: noticia.estado ?? 'borrador',
            visibilidad: noticia.visibilidad ?? 'publica',
            fecha_publicacion: fecha,
        },
        publicacion: visible
            ? { idNoticia: id, version: 1, claveIdempotente, idEvento: 9000 + id, idUsuario: 0 }
            : null,
    };
    resultadosPorClave.set(claveIdempotente, resultado);
    return { guardarNoticiaCms: resultado };
}
