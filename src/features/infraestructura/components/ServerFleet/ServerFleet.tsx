"use client";
import { useQuery } from "@tanstack/react-query";
import { platformKey } from "@/platform/query";
import Link from "next/link";
import { useEffect, useEffectEvent } from "react";
import classNames from "classnames";
import { platformFetch } from "@/platform/client";
import { usagePercent, uptime, type ServerSnapshot } from "@/platform/monitoring";
import type { PageResult, PlatformRecord } from "@/platform/types";
import styles from "./ServerFleet.module.scss";

type Server = { record: PlatformRecord; snapshot: ServerSnapshot | null };
export type ServerHealth = "ok" | "warn" | "down";

export function serverHealth(snapshot: ServerSnapshot | null): ServerHealth {
    if (!snapshot?.disponible) return "down";
    const stopped = snapshot.contenedores.filter((c) => c.estado !== "running").length;
    return snapshot.estado !== "ACTUAL" || stopped ? "warn" : "ok";
}
const HEALTH_LABEL: Record<ServerHealth, string> = { ok: "Operativo", warn: "Revisar", down: "Sin datos" };

/**
 * Flota de servidores: una tarjeta por servidor con su salud y consumo.
 * Con `onSelect` funciona como selector; sin él, cada tarjeta enlaza a Servidores.
 */
export function ServerFleet({
    limit = 12,
    selected,
    onSelect,
    revision = 0,
    onLoaded,
}: {
    limit?: number;
    selected?: string;
    onSelect?: (id: string) => void;
    revision?: number;
    onLoaded?: (ids: string[]) => void;
}) {
    const fleet = useQuery({
        queryKey: [...platformKey(`/flota?limit=${limit}`), revision],
        queryFn: async ({ signal }) => {
            const opts = { signal };
            const r = await platformFetch<PageResult<PlatformRecord>>(
                `/records/servidores?limit=${limit}`,
                opts,
            );
            return Promise.all(
                r.items.map(async (record) => ({
                    record,
                    snapshot: await platformFetch<ServerSnapshot>("/monitor/" + record.id, opts).catch(
                        () => null,
                    ),
                })),
            );
        },
    });
    const servers: Server[] | null = fleet.isPending ? null : (fleet.data ?? []);
    // Avisa al padre qué servidores hay (p. ej. para elegir el primero en el monitor).
    const loadedIds = fleet.data?.map((row) => row.record.id).join(",");
    const notifyLoaded = useEffectEvent((ids: string[]) => onLoaded?.(ids));
    useEffect(() => {
        if (loadedIds !== undefined) notifyLoaded(loadedIds ? loadedIds.split(",") : []);
    }, [loadedIds]);

    const counts = (servers || []).reduce(
        (acc, s) => ({ ...acc, [serverHealth(s.snapshot)]: acc[serverHealth(s.snapshot)] + 1 }),
        { ok: 0, warn: 0, down: 0 } as Record<ServerHealth, number>,
    );
    return (
        <div className={styles.fleet}>
            {servers && servers.length > 0 && (
                <p className={styles.summary} role="status">
                    <span data-health="ok">{counts.ok} operativos</span>
                    <span data-health="warn">{counts.warn} por revisar</span>
                    <span data-health="down">{counts.down} sin datos</span>
                </p>
            )}
            <div className={styles.grid}>
                {servers === null && <p className={styles.muted}>Consultando servidores…</p>}
                {servers?.length === 0 && <p className={styles.muted}>No hay servidores registrados.</p>}
                {servers?.map(({ record, snapshot }) => {
                    const m = snapshot?.metricas;
                    const stopped = snapshot?.contenedores.filter((c) => c.estado !== "running").length || 0;
                    const health = serverHealth(snapshot);
                    const meters: [string, number | null][] = m
                        ? [
                              ["CPU", m.cpuPorcentaje ?? null],
                              ["Memoria", usagePercent(m.memoriaUsadaBytes, m.memoriaTotalBytes)],
                              ["Disco", usagePercent(m.discoUsadoBytes, m.discoTotalBytes)],
                          ]
                        : [];
                    const body = (
                        <>
                            <span className={styles.head}>
                                <span className={styles.dot} aria-hidden="true" />
                                <strong>{record.nombre}</strong>
                                <small>{HEALTH_LABEL[health]}</small>
                            </span>
                            {meters.map(([label, value]) => (
                                <span key={label} className={styles.meter}>
                                    <span>{label}</span>
                                    <span
                                        className={styles.track}
                                        data-level={
                                            (value ?? 0) > 85 ? "high" : (value ?? 0) > 65 ? "mid" : "low"
                                        }
                                    >
                                        <span style={{ width: `${Math.min(100, value ?? 0)}%` }} />
                                    </span>
                                    <span className={styles.pct}>
                                        {value === null ? "—" : Math.round(value) + "%"}
                                    </span>
                                </span>
                            ))}
                            {!meters.length && (
                                <span className={styles.noData}>Sin mediciones recientes</span>
                            )}
                            <span className={styles.foot}>
                                {snapshot?.contenedores.length ?? 0} contenedores
                                {stopped ? ` · ${stopped} detenido${stopped > 1 ? "s" : ""}` : ""}
                                {m?.uptimeSegundos ? ` · activo ${uptime(m.uptimeSegundos)}` : ""}
                            </span>
                        </>
                    );
                    return onSelect ? (
                        <button
                            key={record.id}
                            type="button"
                            className={classNames(styles.card, { [styles.selected]: selected === record.id })}
                            data-health={health}
                            aria-pressed={selected === record.id}
                            onClick={() => onSelect(record.id)}
                        >
                            {body}
                        </button>
                    ) : (
                        <Link
                            key={record.id}
                            href="/espacio/infraestructura"
                            className={styles.card}
                            data-health={health}
                        >
                            {body}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
export default ServerFleet;
