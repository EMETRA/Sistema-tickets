/**
 * Convierte un texto en un slug para URL: sin acentos, en minúsculas y separado por guiones.
 *
 * Ejemplo: "Actualización del sistema" → "actualizacion-del-sistema"
 */
export function slugify(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
