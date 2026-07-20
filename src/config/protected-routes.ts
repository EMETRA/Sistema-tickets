export const protectedRoutes = [
    "/home",
    "/tickets",
    "/tickets-creation",
    "/mis-tickets",
    "/statistics",
    "/equipo",
    "/config",
    "/usuarios",
];

export const publicRoutes = ["/"];

/** Rutas solo para usuarios no logueados (redirigen a /home si hay sesión). */
export const nologRoutes = ["/login", "/forgot-password"];

/**
 * Requieren sesión pero no pasan por el gate de roles
 * (evita loops al denegar acceso).
 */
export const sessionOnlyRoutes = ["/unauthorized"];
