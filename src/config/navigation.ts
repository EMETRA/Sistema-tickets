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
        "equipo", 
        "usuarios",
        "tickets", 
        "config", 
        "crear_ticket", 
        // "historial",
        // "planifica",
        // "reportes", 
        "estadistica"
    ],
    TECNICO: [
        "home",
        "mis_tickets",
        "crear_ticket",
        // "planifica",
        "equipo",
        "usuarios",
        // "historial"
    ],
    USUARIO: [
        "home",
        "crear_ticket",
        "tickets",
        // "historial",
        "usuarios",
        // "reportes"
    ],
    DESARROLLADOR: [
        "home",
        "tickets",
        "crear_ticket",
        // "planifica",
        "equipo",
        "usuarios",
        // "historial"
    ],
};

// 3. HELPER: Mapea los IDs al objeto de metadata real
export const getMenuByRole = (role: UserRole): PageMetadata[] => {
    const layout = ROLE_LAYOUTS[role] ?? ROLE_LAYOUTS['USUARIO'];
    return layout.map(id => PAGES_CONFIG[id]);
};