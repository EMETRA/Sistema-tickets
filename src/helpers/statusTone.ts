/**
 * Tono visual para estados de registros. El texto siempre acompaña al color,
 * pero el tono permite detectar excepciones (Denegado, Pendiente) sin leer
 * fila por fila.
 */
export type StatusTone = "success" | "danger" | "warning" | "info" | "neutral";

const TONES: Record<Exclude<StatusTone, "neutral">, string[]> = {
    success: [
        "CORRECTO",
        "APROBADO",
        "APROBADA",
        "ACTIVO",
        "ACTIVA",
        "HABILITADO",
        "HABILITADA",
        "RESUELTO",
        "COMPLETADO",
        "COMPLETADA",
        "FINALIZADO",
        "PUBLICADO",
        "EN EJECUCION",
        "DISPONIBLE",
        "OPERATIVO",
        "VIGENTE",
        "ATENDIDA",
        "ATENDIDO",
    ],
    danger: [
        "DENEGADO",
        "DENEGADA",
        "RECHAZADO",
        "RECHAZADA",
        "ERROR",
        "FALLIDO",
        "FALLIDA",
        "BLOQUEADO",
        "BLOQUEADA",
        "CRITICO",
        "CAIDO",
        "DADO DE BAJA",
        "BAJA",
    ],
    warning: [
        "PENDIENTE",
        "EN REVISION",
        "POR REVISAR",
        "EN ESPERA",
        "SIN PRIMERA ATENCION",
        "MANTENIMIENTO",
        "EN MANTENIMIENTO",
        "SUSPENDIDO",
        "SUSPENDIDA",
        "PAUSADO",
    ],
    info: [
        "ASIGNADO",
        "ASIGNADA",
        "EN ATENCION",
        "EN PROCESO",
        "EN CURSO",
        "EN DESARROLLO",
        "PROGRAMADO",
        "PROGRAMADA",
        "APROBADA PENDIENTE CUENTA",
    ],
};

function normalize(value: string) {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replaceAll("_", " ")
        .trim()
        .toUpperCase();
}

export function statusTone(value: string | null | undefined): StatusTone {
    if (!value) return "neutral";
    const key = normalize(value);
    for (const [tone, list] of Object.entries(TONES))
        if (list.includes(key)) return tone as StatusTone;
    return "neutral";
}

/** "EN_REVISION" → "En revision"; conserva textos que ya vienen en minúsculas. */
export function statusLabel(value: string | null | undefined) {
    if (!value) return "Sin estado";
    const text = value.replaceAll("_", " ").trim();
    if (text !== text.toUpperCase()) return text;
    const lower = text.toLocaleLowerCase("es-GT");
    return lower.charAt(0).toLocaleUpperCase("es-GT") + lower.slice(1);
}
