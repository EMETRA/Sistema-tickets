"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { statusLabel, statusTone } from "@/helpers/statusTone";
import { queryErrorMessage, usePlatformQuery } from "@/platform/query";
import { PLATFORM_SECTIONS } from "@/platform/navigation";
import type { PlatformRecord } from "@/platform/types";
import { daysFromToday, relativeDays } from "@/features/infraestructura/components/AssetsPanel/assetDates";
import { RecordDetail } from "../ResourceWorkspace/RecordDetail";
import { RecordEditor } from "../ResourceWorkspace/RecordEditor";
import common from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import styles from "./RecordSearch.module.scss";

type Result = {
    consulta: string;
    grupos: { tipo: string; titulo: string; grupo: string; items: PlatformRecord[]; total: number }[];
    limitePorGrupo: number;
};
const RECENT_KEY = "panel-busquedas";
const parseRecent = (raw: string): string[] => {
    try {
        const v = JSON.parse(raw);
        return Array.isArray(v) ? v.slice(0, 6) : [];
    } catch {
        return [];
    }
};
const recentSnapshot = () => {
    try {
        return localStorage.getItem(RECENT_KEY) || "[]";
    } catch {
        return "[]";
    }
};
const readRecent = () => parseRecent(recentSnapshot());
const subscribeRecent = (notify: () => void) => {
    window.addEventListener(RECENT_KEY, notify);
    return () => window.removeEventListener(RECENT_KEY, notify);
};

/** Propuesta: búsqueda en vivo de registros del panel, agrupada por sección y abierta en su ficha. */
export function RecordSearch() {
    const [q, setQ] = useState("");
    const [term, setTerm] = useState("");
    const [type, setType] = useState("");
    const recentRaw = useSyncExternalStore(subscribeRecent, recentSnapshot, () => "[]");
    const recent = useMemo(() => parseRecent(recentRaw), [recentRaw]);
    const [open, setOpen] = useState<{ type: string; record: PlatformRecord } | null>(null);
    const [editing, setEditing] = useState<{ type: string; record: PlatformRecord } | null>(null);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        input.current?.focus();
    }, []);
    // Espera 300 ms después de la última tecla antes de consultar.
    useEffect(() => {
        const timer = setTimeout(() => setTerm(q.trim()), 300);
        return () => clearTimeout(timer);
    }, [q]);
    const query = usePlatformQuery<Result>(term.length >= 2 ? "/search?q=" + encodeURIComponent(term) : null);
    const result = q.trim().length >= 2 ? (query.data ?? null) : null;
    const busy = query.isFetching;
    const error = q.trim().length >= 2 ? queryErrorMessage(query.error) : "";
    // El filtro elegido solo vale si la nueva búsqueda tiene ese grupo.
    const activeType = result?.grupos.some((g) => g.tipo === type) ? type : "";
    // Recuerda la búsqueda (solo en este navegador) cuando trae resultados.
    useEffect(() => {
        if (!query.data) return;
        try {
            const next = [
                query.data.consulta,
                ...readRecent().filter((x) => x !== query.data!.consulta),
            ].slice(0, 6);
            localStorage.setItem(RECENT_KEY, JSON.stringify(next));
            window.dispatchEvent(new Event(RECENT_KEY));
        } catch {
            /* sin almacenamiento local */
        }
    }, [query.data]);

    const groups = (result?.grupos || []).filter((g) => !activeType || g.tipo === activeType);
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
                        Escribe al menos dos letras. Se buscan por nombre los registros que tu perfil puede
                        ver: fichas técnicas, dispositivos, sistemas, servidores, ubicaciones, equipos,
                        solicitudes y más.
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
                        <button type="button" aria-pressed={!activeType} onClick={() => setType("")}>
                            Todo <b>{total}</b>
                        </button>
                        {result.grupos.map((g) => (
                            <button
                                key={g.tipo}
                                type="button"
                                aria-pressed={activeType === g.tipo}
                                onClick={() => setType(g.tipo)}
                            >
                                {g.titulo} <b>{g.total}</b>
                            </button>
                        ))}
                    </div>
                    {groups.map((g) => {
                        const icon =
                            PLATFORM_SECTIONS.find((s) => s.id === g.grupo)?.iconName ||
                            "table-cells-large-solid";
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
                                            <button
                                                type="button"
                                                onClick={() => setOpen({ type: g.tipo, record: item })}
                                            >
                                                <span className={styles.name}>{item.nombre}</span>
                                                <span
                                                    className={common.chip}
                                                    data-tone={statusTone(item.estado)}
                                                >
                                                    {statusLabel(item.estado)}
                                                </span>
                                                <span className={styles.when}>
                                                    Actualizado{" "}
                                                    {relativeDays(
                                                        daysFromToday(item.actualizadoEn),
                                                    ).toLowerCase()}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                {g.total > result.limitePorGrupo && (
                                    <p className={styles.more}>
                                        Se muestran {result.limitePorGrupo} de {g.total}. Afina la búsqueda o
                                        abre la sección.
                                    </p>
                                )}
                            </section>
                        );
                    })}
                    {!result.grupos.length && (
                        <p className={styles.empty}>
                            Sin coincidencias para «{result.consulta}» dentro de tu alcance. Prueba con otra
                            palabra del nombre.
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
                    onChanged={() => void query.refetch()}
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
                        void query.refetch();
                    }}
                />
            )}
        </section>
    );
}
export default RecordSearch;
