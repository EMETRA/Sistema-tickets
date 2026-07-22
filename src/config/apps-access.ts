import {
    AppsCatalog,
    resolveAppPath,
    isKnownAppPath,
} from "@/config/apps-catalog";

/**
 * Normaliza el nombre de departamento del usuario al id de app principal.
 * Acepta variantes con acentos, mayúsculas.
 */
export function normalizeDepartment(value?: string | null): string | null {
    if (!value?.trim()) return null;

    const key = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

    const aliases: Record<string, string> = {
        informatica: "informatica",
        rrhh: "rrhh",
        recaudacion: "recaudacion",
        financiero: "financiero",
        juridico: "juridico",
    };

    return aliases[key] ?? null;
}

/**
 * Indica si el departamento puede acceder a una app principal (por id de path).
 */
export function canAccessMainApp(
    departamento: string | null | undefined,
    appId: string
): boolean {
    const normalized = normalizeDepartment(departamento);
    if (!normalized) return false;
    return normalized === appId;
}

/**
 * Gate de autorización para rutas bajo /home/{appId}/...
 * Paths fuera de ese contexto → true (los cubre canAccessPath por rol).
 *
 * @param catalog Si se pasa, también valida que el path exista en el árbol.
 *                En middleware suele omitirse (solo departamento vs appId);
 *                las páginas hacen notFound() si el nodo no existe.
 */
export function canAccessAppPath(
    departamento: string | null | undefined,
    pathname: string,
    catalog?: AppsCatalog | null
): boolean {
    const resolved = resolveAppPath(pathname);

    if (!resolved) return true;

    if (catalog && !isKnownAppPath(pathname, catalog)) return false;

    return canAccessMainApp(departamento, resolved.appId);
}
