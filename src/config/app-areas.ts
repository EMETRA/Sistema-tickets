/**
 * Presentación de las áreas institucionales en el panel: nombre corto y un
 * acento propio para reconocerlas de un vistazo (siempre junto a su nombre).
 */
export function areaName(title: string) {
    return (
        title.replace(/^aplicaciones\s+(de\s+(la\s+|los\s+|las\s+)?)?/i, "") ||
        title
    );
}

const ACCENTS: Record<string, string> = {
    informatica: "#4361ee",
    rrhh: "#c2541a",
    recaudacion: "#0f7a6c",
    financiero: "#2f7d32",
    juridico: "#7048c8",
    juzgado: "#a3324f",
    comunicacion: "#0b6fa8",
};

export function areaAccent(id: string) {
    return ACCENTS[id] || "#4361ee";
}
