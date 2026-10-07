import {
    AppsCatalog,
    resolveAppPath,
    isKnownAppPath,
} from "@/config/apps-catalog";

/**
 * Gate de autorización para rutas bajo /home/{appId}/...
 * El catálogo del usuario es la allowlist: el path tiene que existir en él.
 * Paths fuera de ese contexto → true (los cubre canAccessPath por rol).
 * Sin catálogo, las rutas de app se niegan (fallo cerrado).
 */
export function canAccessAppPath(
    pathname: string,
    catalog?: AppsCatalog | null
): boolean {
    const resolved = resolveAppPath(pathname);

    if (!resolved) return true;

    if (!catalog) return false;

    return isKnownAppPath(pathname, catalog);
}
