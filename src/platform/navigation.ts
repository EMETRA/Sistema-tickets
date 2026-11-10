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
        label: "Personas y accesos",
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
        if (s.id === "accesos")
            return data.actor.admin || data.capabilities.corporateAccess;
        if (s.id === "auditoria") return data.capabilities.audit;
        if (s.id === "solicitudes") return !!data.definitions.solicitudes;
        return Object.values(data.definitions).some((d) => d.group === s.id);
    });
}

/** Navegación principal de las pantallas aprobadas; el resto sigue accesible. */
export function homeNavigation(data: PlatformContextData) {
    const available = platformSections(data);
    const section = (id: string, label?: string) => {
        const item = available.find((s) => s.id === id);
        return item
            ? [
                  {
                      path: "/espacio/" + id,
                      label: label || item.label,
                      iconName: item.iconName,
                  },
              ]
            : [];
    };
    const home = { path: "/home", label: "Inicio", iconName: "house-solid" };
    const mine = {
        path: "/mis-tickets",
        label: "Mis tickets",
        iconName: "ticket-solid",
    };
    const apps = {
        path: "/aplicaciones",
        label: "Aplicaciones",
        iconName: "table-cells-large-solid",
    };
    const calendar = section("calendario");
    const metrics = section(
        "metricas",
        data.capabilities.teamMetrics ? "Métricas" : "Mis métricas",
    );
    const mode = data.actor.mode;
    const primary = data.actor.admin
        ? [
              home,
              ...section("asignacion", "Asignación"),
              mine,
              ...calendar,
              apps,
              ...section("accesos", "Personas y accesos"),
              ...metrics,
              ...section("auditoria"),
          ]
        : mode === "TECNICO"
          ? [
                home,
                ...section("asignacion", "Mis asignados"),
                ...calendar,
                ...section("inventario", "Equipos"),
                ...section("red", "Sedes y cableado"),
                apps,
                ...metrics,
            ]
          : ["DESARROLLADOR", "DEVOPS"].includes(mode)
            ? [
                  home,
                  ...section("asignacion", "Mis asignados"),
                  ...calendar,
                  ...section("sistemas", "Mis sistemas"),
                  ...(mode === "DEVOPS" ? section("infraestructura") : []),
                  ...metrics,
                  apps,
              ]
            : mode === "ASIGNACION"
              ? [
                    home,
                    ...section("asignacion", "Asignación"),
                    mine,
                    ...calendar,
                    apps,
                    ...metrics,
                ]
              : mode === "JEFATURA"
                ? [
                      home,
                      mine,
                      ...section("organizacion", "Mi equipo"),
                      ...calendar,
                      apps,
                      ...section("solicitudes"),
                      ...metrics,
                  ]
                : [home, mine, ...calendar, apps, ...metrics];
    const secondary = available
        .filter((s) => !primary.some((p) => p.path === "/espacio/" + s.id))
        .map((s) => ({
            path: "/espacio/" + s.id,
            label: s.label,
            iconName: s.iconName,
        }));
    return { primary, secondary };
}
