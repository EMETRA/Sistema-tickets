"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import classNames from "classnames";
import { WorkspaceIcon } from "../../atoms/WorkspaceIcon/WorkspaceIcon";
import styles from "./PanelSidebar.module.scss";

export type PanelLink = { path: string; label: string; iconName: string; badge?: number };
export type PanelApp = {
    id: string;
    label: string;
    path: string;
    iconName: string;
    accent: string;
    sections?: PanelLink[];
};

const GROUPS_KEY = "panel-grupos";

function isActive(activePath: string, path: string) {
    return activePath === path || (path !== "/home" && activePath.startsWith(path + "/"));
}

/**
 * Navegación del «Panel institucional»: el trabajo personal,
 * las aplicaciones institucionales (sistemas migrados) y las herramientas
 * de Informática, cada una en su espacio.
 */
export function PanelSidebar({
    primary,
    apps,
    tools,
    toolsLabel = "Informática",
    activePath,
    open,
    onClose,
    onLogout,
    onSearch,
    helpPath = "/ayuda",
    catalogPath = "/aplicaciones",
}: {
    primary: PanelLink[];
    apps: PanelApp[];
    tools: PanelLink[];
    toolsLabel?: string;
    activePath: string;
    open?: boolean;
    onClose?: () => void;
    onLogout?: () => void;
    onSearch?: () => void;
    helpPath?: string;
    catalogPath?: string;
}) {
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    useEffect(() => {
        try {
            // Preferencia guardada en este navegador; se aplica tras montar.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCollapsed(JSON.parse(localStorage.getItem(GROUPS_KEY) || "{}"));
        } catch {
            /* sin almacenamiento: grupos abiertos */
        }
    }, []);
    const toggle = (id: string) =>
        setCollapsed((current) => {
            const next = { ...current, [id]: !current[id] };
            try {
                localStorage.setItem(GROUPS_KEY, JSON.stringify(next));
            } catch {
                /* preferencia no persistente */
            }
            return next;
        });
    // El activo es el enlace más específico que coincide con la ruta.
    const allPaths = [
        ...primary.map((p) => p.path),
        ...apps.flatMap((a) => [a.path, ...(a.sections || []).map((s) => s.path)]),
        ...tools.map((t) => t.path),
        catalogPath,
    ];
    const active = allPaths.filter((p) => isActive(activePath, p)).sort((a, b) => b.length - a.length)[0];
    const toolsOpen = !collapsed.tools || tools.some((t) => t.path === active);
    const appsOpen = !collapsed.apps || apps.some((a) => activePath.startsWith(a.path));

    const link = (item: PanelLink, compact = false) => (
        <Link
            key={item.path}
            href={item.path}
            onClick={onClose}
            title={item.label}
            aria-current={active === item.path ? "page" : undefined}
            className={classNames(styles.item, { [styles.compact]: compact })}
        >
            <span className={styles.icon}>
                <WorkspaceIcon name={item.iconName} size={compact ? 18 : 20} />
            </span>
            <span className={styles.label}>{item.label}</span>
            {!!item.badge && <span className={styles.badge}>{item.badge}</span>}
        </Link>
    );

    return (
        <>
            {open && (
                <button
                    type="button"
                    className={styles.backdrop}
                    onClick={onClose}
                    aria-label="Cerrar menú"
                />
            )}
            <aside
                id="system-navigation"
                aria-label="Navegación del panel institucional"
                className={classNames(styles.sidebar, { [styles.open]: open })}
            >
                <Link href="/home" className={styles.brand} onClick={onClose}>
                    <span className={styles.mark} aria-hidden="true">
                        E
                    </span>
                    <span>
                        <strong>EMETRA</strong>
                        <small>Panel institucional</small>
                    </span>
                </Link>
                {onSearch && (
                    <button type="button" className={styles.search} onClick={onSearch}>
                        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path
                                d="m20 20-3.5-3.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span>Buscar o ir a…</span>
                        <kbd>⌘K</kbd>
                    </button>
                )}
                <nav className={styles.nav} aria-label="Menú principal">
                    <div className={styles.group} data-tour="nav-principal">
                        {primary.map((item) => link(item))}
                    </div>

                    <section
                        className={styles.group}
                        aria-labelledby="grupo-aplicaciones"
                        data-tour="nav-aplicaciones"
                    >
                        <button
                            type="button"
                            id="grupo-aplicaciones"
                            className={styles.groupToggle}
                            aria-expanded={appsOpen}
                            onClick={() => toggle("apps")}
                        >
                            <span>Aplicaciones</span>
                            <span className={styles.chevron} aria-hidden="true" />
                        </button>
                        {appsOpen && (
                            <div className={styles.groupBody}>
                                {apps.map((app) => {
                                    const inside = activePath.startsWith(app.path);
                                    return (
                                        <div key={app.id} className={styles.app}>
                                            <Link
                                                href={app.path}
                                                onClick={onClose}
                                                title={app.label}
                                                aria-current={active === app.path ? "page" : undefined}
                                                className={classNames(styles.item, styles.compact, {
                                                    [styles.inside]: inside,
                                                })}
                                                style={{ "--accent": app.accent } as React.CSSProperties}
                                            >
                                                <span className={styles.appIcon}>
                                                    <WorkspaceIcon name={app.iconName} size={14} />
                                                </span>
                                                <span className={styles.label}>{app.label}</span>
                                            </Link>
                                            {inside && !!app.sections?.length && (
                                                <div className={styles.sections}>
                                                    {app.sections.map((section) => (
                                                        <Link
                                                            key={section.path}
                                                            href={section.path}
                                                            onClick={onClose}
                                                            aria-current={
                                                                active === section.path ? "page" : undefined
                                                            }
                                                            className={styles.section}
                                                        >
                                                            {section.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <Link
                                    href={catalogPath}
                                    onClick={onClose}
                                    aria-current={active === catalogPath ? "page" : undefined}
                                    className={classNames(styles.item, styles.compact, styles.catalog)}
                                >
                                    <span className={styles.icon}>
                                        <WorkspaceIcon name="table-cells-large-solid" size={18} />
                                    </span>
                                    <span className={styles.label}>
                                        {apps.length ? "Todas las aplicaciones" : "Catálogo de aplicaciones"}
                                    </span>
                                </Link>
                            </div>
                        )}
                    </section>

                    {tools.length > 0 && (
                        <section
                            className={styles.group}
                            aria-labelledby="grupo-herramientas"
                            data-tour="nav-herramientas"
                        >
                            <button
                                type="button"
                                id="grupo-herramientas"
                                className={styles.groupToggle}
                                aria-expanded={toolsOpen}
                                onClick={() => toggle("tools")}
                            >
                                <span>{toolsLabel}</span>
                                <span className={styles.chevron} aria-hidden="true" />
                            </button>
                            {toolsOpen && (
                                <div className={styles.groupBody}>
                                    {tools.map((item) => link(item, true))}
                                </div>
                            )}
                        </section>
                    )}
                </nav>
                <div className={styles.footer}>
                    <Link href={helpPath} onClick={onClose} data-tour="ayuda">
                        <WorkspaceIcon name="help" size={18} />
                        <span>Ayuda</span>
                    </Link>
                    {onLogout && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose?.();
                                onLogout();
                            }}
                        >
                            <WorkspaceIcon name="right-from-bracket-solid" size={18} />
                            <span>Cerrar sesión</span>
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
export default PanelSidebar;
