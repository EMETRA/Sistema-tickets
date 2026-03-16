export const APP_ROUTES = {
    "/": { title: "Inicio", icon: "house-solid" },
    "/profile": { title: "Perfil", icon: "people-group-solid" },
    "/tickets": { title: "Mis Tickets", icon: "ticket-solid" },
    "/perfil": { title: "Mi Perfil", icon: "user-solid" },
    "/configuracion": { title: "Configuración", icon: "gear-solid" },
    "/tickets-creation": { title: "Crear Ticket", icon: "file-circle-plus-solid" },
} as const;

export type AppPath = keyof typeof APP_ROUTES;
