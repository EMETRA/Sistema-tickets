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

export function getMainApp(
    appId: string,
    catalog: AppsCatalog,
): MainApp | null {
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
    catalog: AppsCatalog,
): AppSection | null {
    return catalog[appId]?.sections[sectionId] ?? null;
}

export function getModules(
    appId: string,
    sectionId: string,
    catalog: AppsCatalog,
): AppMeta[] {
    return getSection(appId, sectionId, catalog)?.modules ?? [];
}

export function getModule(
    appId: string,
    sectionId: string,
    moduleId: string,
    catalog: AppsCatalog,
): AppMeta | null {
    const modules = getModules(appId, sectionId, catalog);
    return modules.find((m) => m.id === moduleId) ?? null;
}

export function getFirstSectionId(
    appId: string,
    catalog: AppsCatalog,
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
export function isKnownAppPath(
    pathname: string,
    catalog: AppsCatalog,
): boolean {
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
    catalog: AppsCatalog,
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
            catalog,
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
    moduleId: string,
): string {
    return `/home/${appId}/${sectionId}/${moduleId}`;
}

/** Catálogo público vigente, incluso si el API conserva la ubicación anterior. */
export function publicAppsCatalog(catalog: AppsCatalog): AppsCatalog {
    const result: AppsCatalog = {};
    let caseModule: AppMeta | undefined;
    const hidden = [
        "proc01",
        "mod13",
        "mod06",
        "mod01",
        "exportmod01",
        "save-mod01",
        "dashboard-proyectos",
        "dashboard-colaboradores",
    ];
    for (const [appId, app] of Object.entries(catalog)) {
        const sections: Record<string, AppSection> = {};
        for (const [sectionId, section] of Object.entries(app.sections)) {
            const modules = section.modules.filter((module) => {
                if (hidden.includes(module.id)) return false;
                if (module.id === "juz01") {
                    caseModule ??= module;
                    return false;
                }
                return true;
            });
            if (modules.length || section.modules.length === 0)
                sections[sectionId] = { ...section, modules };
        }
        if (
            Object.keys(sections).length ||
            Object.keys(app.sections).length === 0
        )
            result[appId] = { ...app, sections };
    }
    // Solo se traslada un módulo ya autorizado; nunca se crea un acceso nuevo.
    if (caseModule) {
        const app = result.juzgado;
        const section = app?.sections.consultas;
        const iconName = caseModule.iconName;
        const meta = (id: string, title: string): AppMeta => ({
            id,
            label: title,
            title,
            iconName,
        });
        result.juzgado = {
            meta: meta("juzgado", "Aplicaciones Juzgado"),
            sections: {
                ...app?.sections,
                consultas: {
                    meta: meta("consultas", "Consultas"),
                    modules: [...(section?.modules ?? []), { ...caseModule }],
                },
            },
        };
    }
    return result;
}

/** Destinos de marcadores antiguos; el destino conserva sus controles de acceso. */
export function legacyApplicationDestination(pathname: string): string | null {
    const match = pathname.match(
        /^\/home\/[^/]+\/[^/]+\/([^/]+)(\/detail)?\/?$/,
    );
    if (!match) return null;
    const [, moduleId, detail = ""] = match;
    if (moduleId === "juz01") {
        const target = `/home/juzgado/consultas/juz01${detail}`;
        return pathname.replace(/\/$/, "") === target ? null : target;
    }
    if (["dashboard-proyectos", "dashboard-colaboradores"].includes(moduleId))
        return "/espacio/metricas";
    if (moduleId === "mod06") return "/espacio/accesos?tab=corporate";
    if (
        ["proc01", "mod13", "mod01", "exportmod01", "save-mod01"].includes(
            moduleId,
        )
    )
        return "/aplicaciones/en-desuso";
    return null;
}
