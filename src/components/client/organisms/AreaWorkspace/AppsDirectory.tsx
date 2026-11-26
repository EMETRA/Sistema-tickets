"use client";
import Link from "next/link";
import { useState } from "react";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import type { AppsCatalog } from "@/config/apps-catalog";
import { buildModulePath, buildSectionPath } from "@/config/apps-catalog";
import { areaAccent, areaName } from "@/config/app-areas";
import styles from "./AppsDirectory.module.scss";

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Directorio de aplicaciones institucionales (propuesta): todas las áreas, secciones y módulos de un vistazo. */
export function AppsDirectory({ catalog }: { catalog: AppsCatalog }) {
    const [query, setQuery] = useState("");
    const q = norm(query.trim());
    const areas = Object.values(catalog)
        .map((app) => {
            const name = areaName(app.meta.title);
            const areaMatch = !q || norm(name).includes(q);
            const sections = Object.values(app.sections)
                .map((s) => ({
                    ...s,
                    modules: s.modules.filter(
                        (m) => areaMatch || norm(`${m.title} ${m.label} ${s.meta.title}`).includes(q),
                    ),
                }))
                .filter((s) => s.modules.length);
            return { app, name, sections };
        })
        .filter((a) => a.sections.length);
    const total = Object.values(catalog).reduce(
        (n, a) => n + Object.values(a.sections).reduce((m, s) => m + s.modules.length, 0),
        0,
    );
    return (
        <div className={styles.directory}>
            <div className={styles.toolbar}>
                <p>
                    {Object.keys(catalog).length} áreas · {total} módulos autorizados para tu perfil
                </p>
                <label className={styles.filter}>
                    <span className={styles.srOnly}>Filtrar aplicaciones</span>
                    <input
                        type="search"
                        placeholder="Filtrar por área o módulo…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
            </div>
            <div className={styles.grid}>
                {areas.map(({ app, name, sections }) => (
                    <section
                        key={app.meta.id}
                        className={styles.area}
                        style={{ "--accent": areaAccent(app.meta.id) } as React.CSSProperties}
                        aria-labelledby={"area-" + app.meta.id}
                    >
                        <Link href={`/home/${app.meta.id}`} className={styles.head}>
                            <span className={styles.icon}>
                                <WorkspaceIcon name={app.meta.iconName} size={20} />
                            </span>
                            <span>
                                <strong id={"area-" + app.meta.id}>{name}</strong>
                                <small>
                                    {sections.length} {sections.length === 1 ? "sección" : "secciones"}
                                </small>
                            </span>
                            <span className={styles.arrow} aria-hidden="true">
                                →
                            </span>
                        </Link>
                        <div className={styles.sections}>
                            {sections.map((s) => (
                                <div key={s.meta.id}>
                                    <Link href={buildSectionPath(app.meta.id, s.meta.id)} className={styles.sectionName}>
                                        {s.meta.title}
                                    </Link>
                                    <ul>
                                        {s.modules.map((m) => (
                                            <li key={m.id}>
                                                <Link href={buildModulePath(app.meta.id, s.meta.id, m.id)}>
                                                    {m.title}
                                                    <small>{m.label}</small>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            {!areas.length && <p className={styles.empty}>Ningún área o módulo coincide con «{query}».</p>}
        </div>
    );
}
export default AppsDirectory;
