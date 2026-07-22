import { UserRole } from "@/types/roles";
import { PAGES_CONFIG, ROLE_LAYOUTS } from "@/config/navigation";

/**
 * Paths base permitidos por rol, derivados de ROLE_LAYOUTS + PAGES_CONFIG.
 * Cambiar el menú = cambiar el acceso.
 */
function getAllowedPathsForRole(role: UserRole): string[] {
    const layout = ROLE_LAYOUTS[role] ?? ROLE_LAYOUTS.USUARIO;

    return layout
        .map((pageId) => PAGES_CONFIG[pageId]?.path)
        .filter((path): path is string => Boolean(path));
}

/**
 * Indica si un rol puede acceder a un pathname.
 * Match por igualdad o prefijo (p.ej. /home → /home/informatica/..., /equipo → /equipo/123).
 * Rutas no listadas en ROLE_LAYOUTS se deniegan.
 */
export function canAccessPath(role: UserRole | null | undefined, pathname: string): boolean {
    if (!role) return false;

    const allowedPaths = getAllowedPathsForRole(role);

    return allowedPaths.some((basePath) => {
        if (pathname === basePath) return true;
        if (pathname.startsWith(`${basePath}/`)) return true;
        return false;
    });
}
