// types/roles.ts
export type UserRole = "ADMINISTRADOR" | "TECNICO" | "DESARROLLADOR" | "USUARIO";

// Roles que tienen comportamiento de "TECH" (mismos permisos)
export const TECH_ROLES: UserRole[] = ["TECNICO", "DESARROLLADOR"];
export const ADMIN_ROLES: UserRole[] = ["ADMINISTRADOR"];

// Helper para saber si es técnico (cualquiera de los dos)
export const isTechRole = (role: UserRole) => TECH_ROLES.includes(role);
export const isAdminRole = (role: UserRole) => ADMIN_ROLES.includes(role);

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

export const ROLE_LAYOUTS: Record<UserRole, string[]> = {
    ADMINISTRADOR: [
        "home",
        "equipo", 
        "usuarios",
        "tickets", 
        "config", 
        "mis_tickets",
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
    DESARROLLADOR: [
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
        // "historial",
        "usuarios",
        // "reportes"
    ]
};

// 3. HELPER: Mapea los IDs al objeto de metadata real
export const getMenuByRole = (role: UserRole): PageMetadata[] => {
    console.log("Obteniendo menú para rol:", role);
    const layout = ROLE_LAYOUTS[role] ?? ROLE_LAYOUTS['USUARIO'];
    return layout.map(id => PAGES_CONFIG[id]);
};