// src/config/routes.ts

export const ROLES = {
    ADMIN: 'admin',
    TECNICO: 'tecnico',
    USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export interface RouteConfig {
    title: string;
    icon: string;
    roles: UserRole[] | 'all'; // Roles que pueden ver esta ruta
}

export const APP_ROUTES: Record<string, RouteConfig> = {
    "/": { 
        title: "Inicio", 
        icon: "house-solid", 
        roles: 'all' 
    },
    "/perfil": { 
        title: "Mi Perfil", 
        icon: "user-solid", 
        roles: 'all' 
    },
    "/tickets": { 
        title: "Mis Tickets", 
        icon: "ticket-solid", 
        roles: [ROLES.ADMIN, ROLES.TECNICO, ROLES.USER] 
    },
    "/tickets-creation": { 
        title: "Crear Ticket", 
        icon: "file-circle-plus-solid", 
        roles: [ROLES.USER]
    },
    "/usuarios": { 
        title: "Gestión de Usuarios", 
        icon: "people-group-solid", 
        roles: [ROLES.ADMIN]
    },
    "/configuracion": { 
        title: "Configuración", 
        icon: "gear-solid", 
        roles: [ROLES.ADMIN] 
    },
} as const;

export type AppPath = keyof typeof APP_ROUTES;