import type { GuardarNoticiaCmsInput } from "@/api/graphql/COM03";

/**
 * Último intento de guardado: la clave que se usó y el contenido que se envió con ella.
 */
export interface IntentoGuardado {
    clave: string;
    contenido: string;
}

/**
 * Contenido de un intento: todo el input menos la clave. Si cambia cualquier dato (título, HTML de
 * una sección, categorías, estado, fecha, recursos…), cambia este texto.
 * El input se arma siempre en el mismo orden (buildGuardarNoticiaPayload), así que dos inputs
 * iguales dan el mismo texto.
 */
export function contenidoDelIntento(input: GuardarNoticiaCmsInput): string {
    return JSON.stringify({ ...input, claveIdempotente: undefined });
}

/**
 * Regla de la clave idempotente (README "Noticias CMS", sección 6):
 * - Mismo contenido que el intento anterior (timeout, red, doble clic, "Reintentar"):
 *   se reenvía la misma clave, y backend responde `idempotente: true` en lugar de duplicar.
 * - Contenido distinto: clave nueva. Reusar la anterior con otro contenido responde 409
 *   IDEMPOTENCY_CONFLICT.
 * `nuevaClave` debe devolver de 1 a 64 caracteres (createIdempotencyKey: UUID de 36).
 */
export function claveParaIntento(
    anterior: IntentoGuardado | null,
    contenido: string,
    nuevaClave: () => string,
): IntentoGuardado {
    if (anterior && anterior.contenido === contenido) return anterior;
    return { clave: nuevaClave(), contenido };
}
