import { guatemalaDay } from "@/platform/dates";
import type { PlatformRecord } from "@/platform/types";

/** Días entre hoy (Guatemala) y una fecha AAAA-MM-DD o ISO. Negativo = pasado. */
export function daysFromToday(value: unknown) {
    const text = String(value || "");
    const day = /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : text ? guatemalaDay(new Date(text)) : "";
    if (!day) return null;
    const diff = Date.parse(day + "T12:00:00Z") - Date.parse(guatemalaDay() + "T12:00:00Z");
    return Math.round(diff / 86400000);
}

export function relativeDays(days: number | null) {
    if (days === null) return "Sin fecha";
    if (days === 0) return "Hoy";
    if (days === 1) return "Mañana";
    if (days === -1) return "Ayer";
    return days > 0 ? `En ${days} días` : `Hace ${-days} días`;
}

/** Último mantenimiento de cada activo: su próxima revisión es la que cuenta. */
export function latestByAsset(rows: PlatformRecord[]) {
    const latest = new Map<string, PlatformRecord>();
    for (const row of rows) {
        const key = String(row.datos.activoId || row.id);
        const current = latest.get(key);
        if (!current || String(row.datos.fecha) > String(current.datos.fecha)) latest.set(key, row);
    }
    return [...latest.values()];
}
