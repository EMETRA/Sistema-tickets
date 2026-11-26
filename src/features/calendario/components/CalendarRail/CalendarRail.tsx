"use client";
import { meetingLink, meetingPlace } from "@/platform/meeting";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePlatformQueries } from "@/platform/query";
import { usePlatform } from "@/platform/context";
import {
    activitiesForDay,
    activityScope,
    activityTime,
    calendarDate,
    monthCells,
    shiftCalendarDay,
} from "@/platform/calendar";
import { guatemalaDay } from "@/platform/dates";
import type { PageResult, PlatformRecord } from "@/platform/types";
import styles from "./CalendarRail.module.scss";

type Scope = "EQUIPO" | "EMPRESA" | "PRIVADA";
type OpsEvent = {
    id: string;
    day: string;
    time?: string;
    kind: "revision" | "despliegue";
    title: string;
    detail: string;
    tone: string;
    href: string;
};

const cap = (text: string) => text.charAt(0).toLocaleUpperCase("es-GT") + text.slice(1);
const DEPLOY_TONE: Record<string, string> = { CORRECTO: "success", FALLIDO: "danger", REVERTIDO: "warning" };
const ENV: Record<string, string> = { PRODUCCION: "Producción", QA: "QA", DESARROLLO: "Desarrollo" };

/**
 * Propuesta: columna lateral del calendario con minicalendario, agenda de hoy,
 * filtros con conteo y la operación de Informática del periodo.
 */
export function CalendarRail({
    anchor,
    today,
    from,
    to,
    records,
    scopes,
    scopeLabels,
    onToggleScope,
    onPick,
    onSelect,
}: {
    anchor: string;
    today: string;
    from: string;
    to: string;
    records: PlatformRecord[];
    scopes: Scope[];
    scopeLabels: Record<Scope, string>;
    onToggleScope: (scope: Scope) => void;
    onPick: (day: string) => void;
    onSelect: (record: PlatformRecord) => void;
}) {
    const { data } = usePlatform();
    // Mes del minicalendario: sigue al periodo visible salvo que la persona lo cambie.
    const [picked, setPicked] = useState({ anchor, month: anchor });
    const month = picked.anchor === anchor ? picked.month : anchor;
    const setMonth = (value: string) => setPicked({ anchor, month: value });
    const [now, setNow] = useState(() => Date.now());
    const showOps = !!(
        data?.definitions.intervenciones?.actions.LEER || data?.definitions.despliegues?.actions.LEER
    );

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Operación del periodo: revisiones de activos programadas y despliegues.
    const opsLists = usePlatformQueries<PageResult<PlatformRecord>>(
        ["intervenciones", "despliegues", "activos", "aplicaciones"].map((t) => `/records/${t}?limit=100`),
        { enabled: showOps },
    );
    const ops = useMemo<OpsEvent[] | null>(() => {
        if (!showOps || opsLists.pending) return null;
        const [work, deploys, assets, apps] = opsLists.data.map((r) => r?.items ?? []);
        const first = guatemalaDay(new Date(from)),
            last = guatemalaDay(new Date(Date.parse(to) - 1));

        const name = (rows: PlatformRecord[], id: unknown) => rows.find((r) => r.id === id)?.nombre;
        const inRange = (day: string) => day >= first && day <= last;
        const revisions: OpsEvent[] = work
            .filter(
                (w) =>
                    /^\d{4}-\d{2}-\d{2}$/.test(String(w.datos.proximaRevision || "")) &&
                    inRange(String(w.datos.proximaRevision)),
            )
            .map((w) => ({
                id: "r" + w.id,
                day: String(w.datos.proximaRevision),
                kind: "revision" as const,
                title: "Revisión: " + (name(assets, w.datos.activoId) || w.nombre),
                detail: w.nombre,
                tone: String(w.datos.proximaRevision) < today ? "danger" : "warning",
                href: "/espacio/inventario?view=mantenimientos",
            }));
        const releases: OpsEvent[] = deploys
            .filter((d) => d.datos.fecha && inRange(guatemalaDay(new Date(String(d.datos.fecha)))))
            .map((d) => ({
                id: "d" + d.id,
                day: guatemalaDay(new Date(String(d.datos.fecha))),
                time: activityTime(d.datos.fecha),
                kind: "despliegue" as const,
                title: `${name(apps, d.datos.aplicacionId) || "Sistema"} ${String(d.datos.revision || "")}`,
                detail: `${ENV[String(d.datos.entorno)] || d.datos.entorno} · ${String(d.datos.resultado || "").toLowerCase()}`,
                tone: DEPLOY_TONE[String(d.datos.resultado)] || "neutral",
                href: "/espacio/sistemas",
            }));
        const events = [...revisions, ...releases].sort(
            (a, b) => a.day.localeCompare(b.day) || (a.time || "").localeCompare(b.time || ""),
        );
        return events;
    }, [showOps, opsLists.pending, opsLists.data, from, to, today]);

    const todays = activitiesForDay(records, today)
        .map((s) => s.record)
        .filter((r) => scopes.includes(activityScope(r) as Scope))
        .sort((a, b) => String(a.datos.inicio).localeCompare(String(b.datos.inicio)));
    const next = todays.find((r) => Date.parse(String(r.datos.fin)) > now);
    const minutes = next ? Math.round((Date.parse(String(next.datos.inicio)) - now) / 60000) : null;
    const counts = (["EQUIPO", "EMPRESA", "PRIVADA"] as Scope[]).map((scope) => ({
        scope,
        count: records.filter((r) => activityScope(r) === scope).length,
    }));
    const busyDays = new Set(
        records.flatMap((r) => {
            const start = guatemalaDay(new Date(String(r.datos.inicio)));
            return [start];
        }),
    );
    const cells = monthCells(month);
    const monthStart = month.slice(0, 8) + "01";

    return (
        <aside className={styles.rail} aria-label="Resumen del calendario">
            <section className={styles.block} aria-label="Minicalendario">
                <div className={styles.miniHead}>
                    <button
                        type="button"
                        aria-label="Mes anterior"
                        onClick={() => setMonth(shiftCalendarDay(monthStart, -1))}
                    >
                        ‹
                    </button>
                    <strong>{cap(calendarDate(monthStart, { month: "long", year: "numeric" }))}</strong>
                    <button
                        type="button"
                        aria-label="Mes siguiente"
                        onClick={() => setMonth(shiftCalendarDay(monthStart, 32).slice(0, 8) + "01")}
                    >
                        ›
                    </button>
                </div>
                <div className={styles.mini}>
                    {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                        <span key={i} className={styles.dow}>
                            {d}
                        </span>
                    ))}
                    {cells.map((day, i) =>
                        day ? (
                            <button
                                key={day}
                                type="button"
                                aria-label={calendarDate(day, {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                })}
                                aria-current={day === today ? "date" : undefined}
                                data-selected={day === anchor || undefined}
                                data-busy={busyDays.has(day) || undefined}
                                onClick={() => onPick(day)}
                            >
                                {Number(day.slice(-2))}
                            </button>
                        ) : (
                            <span key={"e" + i} />
                        ),
                    )}
                </div>
            </section>

            <section className={styles.block} aria-labelledby="rail-hoy">
                <h3 id="rail-hoy">
                    Hoy{" "}
                    <small>
                        {cap(calendarDate(today, { weekday: "long", day: "numeric", month: "long" }))}
                    </small>
                </h3>
                {next && minutes !== null && (
                    <div className={styles.next}>
                        <p>
                            {minutes <= 0
                                ? "En curso"
                                : minutes < 60
                                  ? `En ${minutes} min`
                                  : `A las ${activityTime(next.datos.inicio)}`}{" "}
                            · <strong>{next.nombre}</strong>
                        </p>
                        {meetingLink(next.datos.lugar) && (
                            <a
                                className={styles.joinNext}
                                href={meetingLink(next.datos.lugar)!}
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                <VideoGlyph /> {minutes <= 10 ? "Unirse ahora" : "Unirse a la reunión"}
                            </a>
                        )}
                    </div>
                )}
                <ul className={styles.today}>
                    {todays.map((r) => {
                        const link = meetingLink(r.datos.lugar),
                            past = Date.parse(String(r.datos.fin)) < now,
                            room = link ? meetingPlace(r.datos.lugar) : String(r.datos.lugar || "");
                        return (
                            <li key={r.id} className={link && !past ? styles.withJoin : undefined}>
                                <button
                                    type="button"
                                    data-scope={activityScope(r)}
                                    data-past={past || undefined}
                                    onClick={() => onSelect(r)}
                                >
                                    <span className={styles.time}>{activityTime(r.datos.inicio)}</span>
                                    <span className={styles.what}>
                                        {r.nombre}
                                        {(link || room) && (
                                            <small>
                                                {link && (
                                                    <>
                                                        <VideoGlyph /> Virtual{room ? " · " : ""}
                                                    </>
                                                )}
                                                {room}
                                            </small>
                                        )}
                                    </span>
                                </button>
                                {link && !past && (
                                    <a
                                        className={styles.join}
                                        href={link}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        aria-label={"Unirse a " + r.nombre}
                                    >
                                        Unirse
                                    </a>
                                )}
                            </li>
                        );
                    })}
                    {!todays.length && <li className={styles.none}>Sin actividades para hoy.</li>}
                </ul>
            </section>

            <section className={styles.block} aria-labelledby="rail-filtros">
                <h3 id="rail-filtros">Mostrar</h3>
                <div className={styles.scopes} role="group" aria-label="Filtrar actividades por visibilidad">
                    {counts.map(({ scope, count }) => (
                        <button
                            key={scope}
                            type="button"
                            data-scope={scope}
                            aria-pressed={scopes.includes(scope)}
                            onClick={() => onToggleScope(scope)}
                        >
                            <span className={styles.check} aria-hidden="true" />
                            {scopeLabels[scope]}
                            <em>{count}</em>
                        </button>
                    ))}
                </div>
            </section>

            {showOps && (
                <section className={styles.block} aria-labelledby="rail-ops">
                    <h3 id="rail-ops">
                        Operación de Informática <small>en este periodo</small>
                    </h3>
                    <ul className={styles.ops}>
                        {ops === null && <li className={styles.none}>Consultando…</li>}
                        {ops?.map((e) => (
                            <li key={e.id} data-tone={e.tone}>
                                <Link href={e.href}>
                                    <span className={styles.opsDay}>
                                        {calendarDate(e.day, { weekday: "short", day: "numeric" })}
                                        {e.time && <small>{e.time}</small>}
                                    </span>
                                    <span className={styles.what}>
                                        <span className={styles.kind}>
                                            {e.kind === "revision" ? "Revisión de activo" : "Despliegue"}
                                        </span>
                                        {e.title}
                                        <small>{e.detail}</small>
                                    </span>
                                </Link>
                            </li>
                        ))}
                        {ops?.length === 0 && (
                            <li className={styles.none}>Sin revisiones ni despliegues en este periodo.</li>
                        )}
                    </ul>
                </section>
            )}
        </aside>
    );
}
export default CalendarRail;

function VideoGlyph() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ verticalAlign: "-2px" }}
        >
            <rect x="3" y="6" width="13" height="12" rx="2.5" />
            <path d="m16 10.5 5-3v9l-5-3" />
        </svg>
    );
}
