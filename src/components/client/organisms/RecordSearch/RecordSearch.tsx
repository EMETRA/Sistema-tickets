"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { statusLabel, statusTone } from "@/helpers/statusTone";
import { platformFetch } from "@/platform/client";
import { PLATFORM_SECTIONS } from "@/platform/navigation";
import type { PlatformRecord } from "@/platform/types";
import { daysFromToday, relativeDays } from "../AssetsPanel/assetDates";
import { RecordDetail } from "../ResourceWorkspace/RecordDetail";
import { RecordEditor } from "../ResourceWorkspace/RecordEditor";
import common from "../../templates/PlatformPage/PlatformPage.module.scss";
import styles from "./RecordSearch.module.scss";

type Result = {
    consulta: string;
    grupos: { tipo: string; titulo: string; grupo: string; items: PlatformRecord[]; total: number }[];
    limitePorGrupo: number;
};
const RECENT_KEY = "panel-busquedas";
const readRecent = (): string[] => {
    try {
        const v = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
        return Array.isArray(v) ? v.slice(0, 6) : [];
    } catch {
        return [];
    }
};

/** Propuesta: búsqueda en vivo de registros del panel, agrupada por sección y abierta en su ficha. */
export function RecordSearch() {
    const [q, setQ] = useState("");
    const [result, setResult] = useState<Result | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [type, setType] = useState("");
    const [recent, setRecent] = useState<string[]>([]);
    const [open, setOpen] = useState<{ type: string; record: PlatformRecord } | null>(null);
    const [editing, setEditing] = useState<{ type: string; record: PlatformRecord } | null>(null);
    const [revision, setRevision] = useState(0);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecent(readRecent());
        input.current?.focus();
    }, []);
    useEffect(() => {
        const term = q.trim();
        if (term.length < 2) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResult(null);
            return;
        }
        const c = new AbortController();
        const timer = setTimeout(() => {
            setBusy(true);
            setError("");
            platformFetch<Result>("/search?q=" + encodeURIComponent(term), { signal: c.signal })
                .then((r) => {
                    if (c.signal.aborted) return;
                    setResult(r);
                    setType((t) => (r.grupos.some((g) => g.tipo === t) ? t : ""));
                    try {
                        const next = [term, ...readRecent().filter((x) => x !== term)].slice(0, 6);
                        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
                        setRecent(next);
                    } catch {
                        /* sin almacenamiento local */
                    }
                })
                .catch((e) => !c.signal.aborted && setError(e instanceof Error ? e.message : "No se pudo consultar la información."))
                .finally(() => !c.signal.aborted && setBusy(false));
        }, 300);
        return () => {
            clearTimeout(timer);
            c.abort();
        };
    }, [q, revision]);

    const groups = (result?.grupos || []).filter((g) => !type || g.tipo === type);
    const total = (result?.grupos || []).reduce((n, g) => n + g.total, 0);
    return (
        <section className={styles.search} aria-label="Buscar registros">
            <label className={styles.box}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className={common.srOnly}>Buscar en mi espacio de trabajo</span>
                <input
                    ref={input}
                    type="search"
                    value={q}
                    maxLength={100}
                    placeholder="Nombre de un equipo, sistema, servidor, ubicación, solicitud…"
                    onChange={(e) => setQ(e.target.value)}
                />
                {busy && <span className={styles.spinner} aria-label="Buscando" />}
            </label>
            {!result && !error && (
                <div className={styles.idle}>
                    {recent.length > 0 && (
                        <div className={styles.recent}>
                            <span>Búsquedas recientes</span>
                            {recent.map((r) => (
                                <button key={r} type="button" onClick={() => setQ(r)}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    )}
                    <p>
                        Escribe al menos dos letras. Se buscan por nombre los registros que tu perfil puede ver: fichas técnicas,
                        dispositivos, sistemas, servidores, ubicaciones, equipos, solicitudes y más.
                    </p>
                </div>
            )}
            {error && (
                <p role="alert" className={common.error}>
                    {error}
                </p>
            )}
            {result && (
                <>
                    <div className={styles.types} role="group" aria-label="Filtrar por tipo de registro">
                        <button type="button" aria-pressed={!type} onClick={() => setType("")}>
                            Todo <b>{total}</b>
                        </button>
                        {result.grupos.map((g) => (
                            <button key={g.tipo} type="button" aria-pressed={type === g.tipo} onClick={() => setType(g.tipo)}>
                                {g.titulo} <b>{g.total}</b>
                            </button>
                        ))}
                    </div>
                    {groups.map((g) => {
                        const icon = PLATFORM_SECTIONS.find((s) => s.id === g.grupo)?.iconName || "table-cells-large-solid";
                        return (
                            <section key={g.tipo} className={styles.group} aria-label={g.titulo}>
                                <header>
                                    <span className={styles.icon} aria-hidden="true">
                                        <WorkspaceIcon name={icon} size={16} />
                                    </span>
                                    <h3>{g.titulo}</h3>
                                    <span className={styles.count}>{g.total}</span>
                                    <Link href={"/espacio/" + g.grupo} className={common.link}>
                                        Abrir sección
                                    </Link>
                                </header>
                                <ul>
                                    {g.items.map((item) => (
                                        <li key={item.id}>
                                            <button type="button" onClick={() => setOpen({ type: g.tipo, record: item })}>
                                                <span className={styles.name}>{item.nombre}</span>
                                                <span className={common.chip} data-tone={statusTone(item.estado)}>
                                                    {statusLabel(item.estado)}
                                                </span>
                                                <span className={styles.when}>Actualizado {relativeDays(daysFromToday(item.actualizadoEn)).toLowerCase()}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {g.total > result.limitePorGrupo && (
                                    <p className={styles.more}>
                                        Se muestran {result.limitePorGrupo} de {g.total}. Afina la búsqueda o abre la sección.
                                    </p>
                                )}
                            </section>
                        );
                    })}
                    {!result.grupos.length && (
                        <p className={styles.empty}>
                            Sin coincidencias para «{result.consulta}» dentro de tu alcance. Prueba con otra palabra del nombre.
                        </p>
                    )}
                </>
            )}
            {open && !editing && (
                <RecordDetail
                    type={open.type}
                    record={open.record}
                    onClose={() => setOpen(null)}
                    onEdit={(r) => setEditing({ type: open.type, record: r })}
                    onChanged={() => setRevision((v) => v + 1)}
                />
            )}
            {editing && (
                <RecordEditor
                    type={editing.type}
                    record={editing.record}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null);
                        setOpen(null);
                        setRevision((v) => v + 1);
                    }}
                />
            )}
        </section>
    );
}
export default RecordSearch;
