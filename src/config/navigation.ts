export type UserRole = "admin" | "tech" | "user";

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
    tickets: { path: "/tickets", label: "TICKETS", title: "Listado de Tickets", iconName: "clipboard-list-solid" },
    config: { path: "/config", label: "CONFIG", title: "Configuración", iconName: "network-wired-solid" },
    mis_tickets: { path: "/mis-tickets", label: "MIS TICKETS", title: "Mis Asignaciones", iconName: "ticket-solid" },
    historial: { path: "/historial", label: "HISTORIAL", title: "Historial de Actividad", iconName: "clock-rotate-left-solid" },
    planifica: { path: "/planifica", label: "PLANIFICA", title: "Planificación", iconName: "person-chalkboard-solid" },
    reportes: { path: "/reportes", label: "REPORTES", title: "Módulo de Reportes", iconName: "chart-pie-solid" },
    estadistica: { path: "/statistics", label: "ESTADISTICA", title: "Estadísticas", iconName: "chart-bar-regular" },
    crear_ticket: { path: "/tickets-creation", label: "CREAR TICKET", title: "Nuevo Ticket", iconName: "file-circle-plus-solid" },
};

// Orden del Sidebar y páginas accesibles por rol
export const ROLE_LAYOUTS: Record<UserRole, string[]> = {
    admin: [
        "home",
        "equipo", 
        "usuarios",
        "tickets", 
        "config", 
        "mis_tickets", 
        // "historial",
        // "planifica",
        // "reportes", 
        "estadistica"
    ],
    tech: [
        "home",
        "mis_tickets",
        // "planifica",
        "equipo",
        "usuarios",
        // "historial"
    ],
    user: [
        "home",
        "crear_ticket",
        // "historial",
        "usuarios",
        // "reportes"
    ]
};

// 3. HELPER: Mapea los IDs al objeto de metadata real
export const getMenuByRole = (role: UserRole): PageMetadata[] => {
    const layout = ROLE_LAYOUTS[role];
    return layout.map(id => PAGES_CONFIG[id]);
};