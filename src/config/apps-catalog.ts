/**
 * Tipos y helpers puros del árbol de aplicaciones.
 */

export type AppMeta = {
    id: string;
    label: string;
    title: string;
    iconName: string;
};

export type AppSection = {
    meta: AppMeta;
    modules: AppMeta[];
};

export type MainApp = {
    meta: AppMeta;
    sections: Record<string, AppSection>;
};

export type AppsCatalog = Record<string, MainApp>;

export type ResolvedAppPath = {
    appId: string;
    sectionId?: string;
    moduleId?: string;
};

export function getMainApps(catalog: AppsCatalog): AppMeta[] {
    return Object.values(catalog).map((app) => app.meta);
}

export function getMainApp(appId: string, catalog: AppsCatalog): MainApp | null {
    return catalog[appId] ?? null;
}

export function getSections(appId: string, catalog: AppsCatalog): AppMeta[] {
    const app = catalog[appId];
    if (!app) return [];
    return Object.values(app.sections).map((section) => section.meta);
}

export function getSection(
    appId: string,
    sectionId: string,
    catalog: AppsCatalog
): AppSection | null {
    return catalog[appId]?.sections[sectionId] ?? null;
}

export function getModules(
    appId: string,
    sectionId: string,
    catalog: AppsCatalog
): AppMeta[] {
    return getSection(appId, sectionId, catalog)?.modules ?? [];
}

export function getModule(
    appId: string,
    sectionId: string,
    moduleId: string,
    catalog: AppsCatalog
): AppMeta | null {
    const modules = getModules(appId, sectionId, catalog);
    return modules.find((m) => m.id === moduleId) ?? null;
}

export function getFirstSectionId(
    appId: string,
    catalog: AppsCatalog
): string | null {
    const sections = Object.keys(catalog[appId]?.sections ?? {});
    return sections[0] ?? null;
}

/**
 * Interpreta un pathname bajo /home/... como contexto de apps.
 * `/home` solo → null (no es contexto de app principal).
 */
export function resolveAppPath(pathname: string): ResolvedAppPath | null {
    if (!pathname.startsWith("/home/")) return null;

    const parts = pathname.slice("/home/".length).split("/").filter(Boolean);
    if (parts.length === 0) return null;

    const [appId, sectionId, moduleId] = parts;
    return {
        appId,
        ...(sectionId ? { sectionId } : {}),
        ...(moduleId ? { moduleId } : {}),
    };
}

/** True si el path completo existe en el catálogo (app / sección / módulo). */
export function isKnownAppPath(pathname: string, catalog: AppsCatalog): boolean {
    const resolved = resolveAppPath(pathname);
    if (!resolved) return false;

    const app = catalog[resolved.appId];
    if (!app) return false;

    if (!resolved.sectionId) return true;

    const section = app.sections[resolved.sectionId];
    if (!section) return false;

    if (!resolved.moduleId) return true;

    return section.modules.some((m) => m.id === resolved.moduleId);
}

/** Metadata para TopBar según la profundidad del path. */
export function getAppPathMeta(
    pathname: string,
    catalog: AppsCatalog
): AppMeta | null {
    const resolved = resolveAppPath(pathname);
    if (!resolved) return null;

    const app = catalog[resolved.appId];
    if (!app) return null;

    if (resolved.moduleId && resolved.sectionId) {
        return getModule(
            resolved.appId,
            resolved.sectionId,
            resolved.moduleId,
            catalog
        );
    }

    if (resolved.sectionId) {
        return app.sections[resolved.sectionId]?.meta ?? null;
    }

    return app.meta;
}

export function buildSectionPath(appId: string, sectionId: string): string {
    return `/home/${appId}/${sectionId}`;
}

export function buildModulePath(
    appId: string,
    sectionId: string,
    moduleId: string
): string {
    return `/home/${appId}/${sectionId}/${moduleId}`;
}
