import type { PlatformRecord } from "@/platform/types";

/** Color y trazo por medio físico; un enlace inactivo siempre es gris discontinuo. */
export const MEDIUM: Record<string, { label: string; color: string; dash?: string }> = {
    FIBRA: { label: "Fibra", color: "#d9822b" },
    UTP: { label: "UTP", color: "#4361ee" },
    INALAMBRICO: { label: "Inalámbrico", color: "#0f7a6c", dash: "2 6" },
    OTRO: { label: "Otro", color: "#7b8ba2" },
};
export const CLASS_LABEL: Record<string, string> = {
    SWITCH: "Switch",
    ROUTER: "Router",
    ACCESS_POINT: "Punto de acceso",
    PANEL: "Panel de parcheo",
    EQUIPO: "Equipo",
};

export function edgeStyle(edge: PlatformRecord) {
    if (edge.estado === "INACTIVO") return { color: "#a3aab8", dash: "6 5" };
    return MEDIUM[String(edge.datos.medio)] || MEDIUM.OTRO;
}

export function portsUsed(device: PlatformRecord, edges: PlatformRecord[]) {
    const used = new Set<number>();
    for (const e of edges) {
        if (e.datos.origenId === device.id) used.add(Number(e.datos.puertoOrigen));
        if (e.datos.destinoId === device.id) used.add(Number(e.datos.puertoDestino));
    }
    return used.size;
}

/** Glifo de 20×20 por clase de dispositivo, para el mapa (SVG). */
export function classGlyph(clase: string) {
    switch (clase) {
        case "ROUTER":
            return "M10 2a8 8 0 1 0 0 16a8 8 0 1 0 0-16M6 10h8M10 6v8M12 4l-2-2-2 2M12 16l-2 2-2-2";
        case "ACCESS_POINT":
            return "M3 8a10 10 0 0 1 14 0M6 11a6 6 0 0 1 8 0M9 14a2 2 0 0 1 2 0M10 17h.01";
        case "PANEL":
            return "M2 5h16v10H2zM5 8h2M9 8h2M13 8h2M5 12h2M9 12h2M13 12h2";
        case "EQUIPO":
            return "M3 3h14v10H3zM7 17h6M10 13v4";
        default:
            return "M2 6h16v8H2zM5 10h1M8 10h1M11 10h1M14 10h1";
    }
}
