/**
 * Fechas escritas por la persona como dd/mm/aaaa y convertidas al formato de la API
 * (ISO 8601, p. ej. "2026-09-30T06:00:00.000Z").
 */

const DD_MM_YYYY = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const YYYY_MM_DD = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Guatemala está en UTC-6 todo el año (no tiene horario de verano). */
const GUATEMALA_TIME_ZONE = "America/Guatemala";
const GUATEMALA_MIDNIGHT_UTC = "T06:00:00.000Z";

const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number) =>
    [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

/**
 * Máscara mientras se escribe: deja solo dígitos (máximo 8) y agrega las barras.
 * "21092026" → "21/09/2026"; "2109" → "21/09".
 */
export function maskDateInput(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/**
 * "21/09/2026" → "2026-09-21" si es una fecha que existe (p. ej. rechaza 31/02/2026).
 * Devuelve null si el formato no es dd/mm/aaaa o la fecha no es válida.
 */
export function ddMmYyyyToIsoDate(value: string): string | null {
    const match = DD_MM_YYYY.exec(value.trim());
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
        return null;
    }
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Valor que se envía a la API: 00:00 de ese día en hora de Guatemala, en ISO 8601.
 * "30/09/2026" → "2026-09-30T06:00:00.000Z". Devuelve null si la fecha no es válida.
 */
export function ddMmYyyyToApiDateTime(value: string): string | null {
    const isoDate = ddMmYyyyToIsoDate(value);
    return isoDate ? `${isoDate}${GUATEMALA_MIDNIGHT_UTC}` : null;
}

/**
 * Fecha que llega de la API ("2026-09-30" o ISO con hora) → "30/09/2026", en hora de Guatemala.
 * Devuelve "" si no hay fecha o no es válida.
 */
export function apiDateToDdMmYyyy(value: string | null | undefined): string {
    if (!value) return "";

    const dateOnly = YYYY_MM_DD.exec(value);
    if (dateOnly) {
        const [, yyyy, mm, dd] = dateOnly;
        return `${dd}/${mm}/${yyyy}`;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat("es-GT", {
        timeZone: GUATEMALA_TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
    return `${part("day")}/${part("month")}/${part("year")}`;
}

/** Hoy en Guatemala como "YYYY-MM-DD" (para comparar con ddMmYyyyToIsoDate). */
export function todayIsoDateGuatemala(now: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: GUATEMALA_TIME_ZONE,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).formatToParts(now);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
}
