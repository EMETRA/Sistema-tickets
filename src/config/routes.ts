export const APP_ROUTES = {
    "/": { title: "Inicio", icon: "house-solid" },
    "/profile": { title: "Gestión de Usuarios", icon: "users-solid" },
    "/tickets": { title: "Mis Tickets", icon: "ticket-solid" },
    "/perfil": { title: "Mi Perfil", icon: "user-solid" },
    "/configuracion": { title: "Configuración", icon: "gear-solid" },
} as const;

export type AppPath = keyof typeof APP_ROUTES;
