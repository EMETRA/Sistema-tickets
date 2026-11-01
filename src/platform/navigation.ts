import type { PlatformContextData } from "./types";
export const PLATFORM_SECTIONS = [
    {
        id: "busqueda",
        label: "Buscar registros",
        iconName: "magnifying-glass-solid",
    },
    { id: "asignacion", label: "Bandeja de tickets", iconName: "ticket-solid" },
    { id: "calendario", label: "Calendario", iconName: "calendar-week-solid" },
    { id: "metricas", label: "Métricas", iconName: "chart-pie-solid" },
    { id: "inventario", label: "Activos y visitas", iconName: "desktop-solid" },
    { id: "red", label: "Cableado y red", iconName: "network-wired-solid" },
    { id: "sistemas", label: "Aplicaciones y sistemas", iconName: "window" },
    {
        id: "infraestructura",
        label: "Servidores",
        iconName: "layer-group-solid",
    },
    {
        id: "solicitudes",
        label: "Solicitudes de acceso",
        iconName: "user-lock-solid",
    },
    {
        id: "organizacion",
        label: "Equipos y responsables",
        iconName: "people-group-solid",
    },
    {
        id: "accesos",
        label: "Perfiles y permisos",
        iconName: "user-lock-solid",
    },
    {
        id: "auditoria",
        label: "Trazabilidad",
        iconName: "clock-rotate-left-solid",
    },
];
export function platformSections(data: PlatformContextData) {
    return PLATFORM_SECTIONS.filter((s) => {
        if (["calendario", "metricas", "asignacion", "busqueda"].includes(s.id))
            return true;
        if (s.id === "accesos") return data.actor.admin;
        if (s.id === "auditoria") return data.capabilities.audit;
        if (s.id === "solicitudes") return !!data.definitions.solicitudes;
        return Object.values(data.definitions).some((d) => d.group === s.id);
    });
}
