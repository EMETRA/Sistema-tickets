import { UserRole } from "../types/roles";

export interface PageMetadata {
    label: string;
    title: string;
    iconName: string;
    path: string;
}

// Metadata única de cada página
export const PAGES_CONFIG: Record<string, PageMetadata> = {
    home: { path: "/home", label: "INICIO", title: "Panel de Inicio", iconName: "house-solid" },
    "home/proc01": { path: "/home/proc01", label: "PROC01", title: "Proceso de grabación unificada de remisiones de cámara LPR", iconName: "chart-bar-solid" },
    "home/mod10": { path: "/home/mod10", label: "MOD10", title: "Formulario reporte de visa nóminas", iconName: "chart-bar-solid" },
    "home/mod01": { path: "/home/mod01", label: "MOD01", title: "Reporte semanal informática", iconName: "clipboard-solid" },
    "home/mod04": { path: "/home/mod04", label: "mod04", title: "Formulario reporte de visa nóminas", iconName: "layer-group-solid" },
    "home/mod05": { path: "/home/mod05", label: "mod05", title: "Reporte general RRHH - EMETRA", iconName: "layer-group-solid" },
    "home/mod06": { path: "/home/mod06", label: "mod06", title: "Asignación de permisos por usuario", iconName: "layer-group-solid" },
    "home/mod07": { path: "/home/mod07", label: "MANUALES", title: "Visor de manuales de usuario | EMETRA", iconName: "chart-bar-solid" },
    "home/mod08": { path: "/home/mod08", label: "MOD08", title: "Generador de Reportes Sistema Financiero- Recibos/Tickets anulados", iconName: "clipboard-solid" },
    "home/dashboard-proyectos": { path: "/home/dashboard-proyectos", label: "dashboard-proyectos", title: "Dashboard de indicadores - Informática", iconName: "chart-bar-solid" },
    "home/dashboard-colaboradores": { path: "/home/dashboard-colaboradores", label: "dashboard-colaboradores", title: "Dashboard por colaborador - Informática", iconName: "chart-bar-solid" },
    "home/exportmod01": { path: "/home/exportmod01", label: "exportmod01", title: "Exportar reporte semanal informática", iconName: "layer-group-solid" },
    "home/save-mod01": { path: "/home/save-mod01", label: "save-mod01", title: "Reporte Guardado", iconName: "clipboard-solid" },
    equipo: { path: "/equipo", label: "EQUIPO", title: "Gestión de Personal", iconName: "people-group-solid" },
    usuarios: { path: "/usuarios", label: "USUARIOS", title: "Administración de Usuarios", iconName: "user-solid" },
    tickets: { path: "/tickets", label: "TICKETS", title: "Listado de Tickets", iconName: "ticket-solid" },
    config: { path: "/config", label: "CONFIG", title: "Configuración", iconName: "network-wired-solid" },
    historial: { path: "/historial", label: "HISTORIAL", title: "Historial de Actividad", iconName: "clock-rotate-left-solid" },
    planifica: { path: "/planifica", label: "PLANIFICA", title: "Planificación", iconName: "person-chalkboard-solid" },
    reportes: { path: "/reportes", label: "REPORTES", title: "Módulo de Reportes", iconName: "chart-pie-solid" },
    estadistica: { path: "/statistics", label: "ESTADISTICA", title: "Estadísticas", iconName: "chart-bar-regular" },
    crear_ticket: { path: "/tickets-creation", label: "CREAR TICKET", title: "Nuevo Ticket", iconName: "file-circle-plus-solid" },
};

export const ROLE_LAYOUTS: Record<UserRole, string[]> = {
    ADMINISTRADOR: [
        "home",
        "usuarios",
        "equipo", 
        "tickets", 
        "config", 
        "crear_ticket", 
        // "historial",
        // "planifica",
        // "reportes", 
        // "estadistica"
    ],
    TECNICO: [
        "home",
        "tickets",
        "crear_ticket",
        // "planifica",
        "usuarios",
        "equipo",
        // "historial"
    ],
    USUARIO: [
        "home",
        "crear_ticket",
        "tickets",
        // "historial",
        "equipo",
        // "reportes"
    ],
    DESARROLLADOR: [
        "home",
        "tickets",
        "crear_ticket",
        // "planifica",
        "usuarios",
        "equipo",
        // "historial"
    ],
};

// 3. HELPER: Mapea los IDs al objeto de metadata real
export const getMenuByRole = (role: UserRole): PageMetadata[] => {
    const layout = ROLE_LAYOUTS[role] ?? ROLE_LAYOUTS['USUARIO'];
    return layout.map(id => PAGES_CONFIG[id]);
};