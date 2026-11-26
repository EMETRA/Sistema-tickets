"use client";
import Link from "next/link";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { buildModulePath, buildSectionPath } from "@/config/apps-catalog";
import { areaAccent, areaName } from "@/config/app-areas";
import { useCreateTicketDialog } from "@/store/useCreateTicketDialog";
import styles from "./AreaWorkspace.module.scss";

/** Portada de un área institucional (propuesta): secciones como pestañas y módulos como accesos. */
export function AreaWorkspace({ appId, sectionId }: { appId: string; sectionId: string }) {
    const { catalog } = useAppsCatalogContext();
    const showCreate = useCreateTicketDialog((s) => s.show);
    const app = catalog?.[appId];
    if (!app) return null;
    const sections = Object.values(app.sections);
    const current = app.sections[sectionId];
    const total = sections.reduce((n, s) => n + s.modules.length, 0);
    const name = areaName(app.meta.title);
    return (
        <div className={styles.area} style={{ "--accent": areaAccent(appId) } as React.CSSProperties}>
            <header className={styles.hero}>
                <span className={styles.icon}>
                    <WorkspaceIcon name={app.meta.iconName} size={26} />
                </span>
                <div>
                    <p className={styles.eyebrow}>Aplicación institucional</p>
                    <h1>{name}</h1>
                    <p className={styles.meta}>
                        {sections.length} {sections.length === 1 ? "sección" : "secciones"} · {total}{" "}
                        {total === 1 ? "módulo" : "módulos"} disponibles para tu perfil
                    </p>
                </div>
            </header>
            {sections.length > 1 && (
                <nav className={styles.tabs} aria-label={`Secciones de ${name}`}>
                    {sections.map((s) => (
                        <Link
                            key={s.meta.id}
                            href={buildSectionPath(appId, s.meta.id)}
                            aria-current={s.meta.id === sectionId ? "page" : undefined}
                        >
                            {s.meta.title}
                            <span>{s.modules.length}</span>
                        </Link>
                    ))}
                </nav>
            )}
            <section aria-label={current?.meta.title || "Módulos"}>
                <div className={styles.modules}>
                    {current?.modules.map((m) => (
                        <Link
                            key={m.id}
                            href={buildModulePath(appId, sectionId, m.id)}
                            className={styles.module}
                        >
                            <span className={styles.moduleIcon}>
                                <WorkspaceIcon name={m.iconName} size={18} />
                            </span>
                            <span className={styles.moduleText}>
                                <strong>{m.title}</strong>
                                <small>{m.label}</small>
                            </span>
                            <span className={styles.arrow} aria-hidden="true">
                                →
                            </span>
                        </Link>
                    ))}
                </div>
                {!current?.modules.length && (
                    <p className={styles.empty}>Esta sección todavía no tiene módulos habilitados.</p>
                )}
            </section>
            <aside className={styles.help}>
                <div>
                    <strong>¿Algo no funciona en {name}?</strong>
                    <p>
                        Informática recibe tu reporte con el área ya identificada y le da seguimiento como
                        ticket.
                    </p>
                </div>
                <button type="button" onClick={showCreate}>
                    Reportar un problema
                </button>
            </aside>
        </div>
    );
}
export default AreaWorkspace;
