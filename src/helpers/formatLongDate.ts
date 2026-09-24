const MONTHS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/**
 * "2026-09-21" → "21 de septiembre del 2026".
 * Lee la fecha como texto para no desfasarla por zona horaria. Devuelve null si el formato no es válido.
 */
export function formatLongDate(isoDate: string): string | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
    if (!match) return null;
    const [, year, month, day] = match;
    return `${Number(day)} de ${MONTHS[Number(month) - 1]} del ${year}`;
}
