import { UserRole } from "../types/roles";

export type { UserRole };

export interface PageMetadata {
  label: string;
  title: string;
  iconName: string;
  path: string;
}

// Metadata única de cada página del menú de sistema
export const PAGES_CONFIG: Record<string, PageMetadata> = {
    ayuda: {path:"/ayuda",label:"Ayuda",title:"Ayuda",iconName:"circle-exclamation-solid"},
    aplicaciones: {
        path: "/aplicaciones",
        label: "Aplicaciones",
        title: "Aplicaciones",
        iconName: "table-cells-large-solid",
    },
    home: {
        path: "/home",
        label: "Inicio",
        title: "Inicio",
        iconName: "house-solid",
    },
    equipo: {
        path: "/equipo",
        label: "Equipo",
        title: "Gestión de Personal",
        iconName: "people-group-solid",
    },
    usuarios: {
        path: "/usuarios",
        label: "Usuarios",
        title: "Administración de Usuarios",
        iconName: "user-solid",
    },
    tickets: {
        path: "/tickets",
        label: "Tickets",
        title: "Listado de Tickets",
        iconName: "ticket-solid",
    },
    config: {
        path: "/config",
        label: "Configuración",
        title: "Configuración",
        iconName: "network-wired-solid",
    },
    historial: {
        path: "/historial",
        label: "HISTORIAL",
        title: "Historial de Actividad",
        iconName: "clock-rotate-left-solid",
    },
    planifica: {
        path: "/planifica",
        label: "PLANIFICA",
        title: "Planificación",
        iconName: "person-chalkboard-solid",
    },
    reportes: {
        path: "/reportes",
        label: "REPORTES",
        title: "Módulo de Reportes",
        iconName: "chart-pie-solid",
    },
    estadistica: {
        path: "/statistics",
        label: "ESTADISTICA",
        title: "Estadísticas",
        iconName: "chart-bar-regular",
    },
    mis_tickets: {
        path: "/mis-tickets",
        label: "Mis tickets",
        title: "Mis tickets creados",
        iconName: "ticket-solid",
    },
    crear_ticket: {
        path: "/tickets-creation",
        label: "CREAR TICKET",
        title: "Nuevo Ticket",
        iconName: "file-circle-plus-solid",
    },
};

export const ROLE_LAYOUTS: Record<UserRole, string[]> = {
    ADMINISTRADOR: [
        "home",
        "mis_tickets",
        "aplicaciones",
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
        "mis_tickets",
        "aplicaciones",
        "tickets",
        "crear_ticket",
        // "planifica",
        "usuarios",
        "equipo",
    // "historial"
    ],
    USUARIO: [
        "home",
        "mis_tickets",
        "aplicaciones",
        "crear_ticket",
        "tickets",
        // "historial",
        "equipo",
    // "reportes"
    ],
    DESARROLLADOR: [
        "home",
        "mis_tickets",
        "aplicaciones",
        "tickets",
        "crear_ticket",
        // "planifica",
        "usuarios",
        "equipo",
    // "historial"
    ],
};

export const getMenuByRole = (role: UserRole): PageMetadata[] => {
    const layout = ROLE_LAYOUTS[role] ?? ROLE_LAYOUTS.USUARIO;
    return layout.map((id) => ({
        ...PAGES_CONFIG[id],
        ...(id === "tickets" && (role === "TECNICO" || role === "DESARROLLADOR")
            ? { label: "Mis asignados" }
            : {}),
    }));
};
