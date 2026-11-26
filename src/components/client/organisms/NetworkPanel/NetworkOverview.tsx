"use client";
import { useEffect, useState } from "react";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { daysFromToday } from "../AssetsPanel/assetDates";
import { portsUsed } from "./networkStyle";
import tiles from "../AssetsPanel/AssetsPanel.module.scss";

/** Resumen de la red: tamaño, enlaces activos, ocupación de puertos y revisiones pendientes. */
export function NetworkOverview({ revision = 0, onSelect }: { revision?: number; onSelect: (tab: string) => void }) {
    const [counts, setCounts] = useState<{ devices?: number; links?: number; inactive?: number; occupancy?: number; stale?: number }>({});
    useEffect(() => {
        const c = new AbortController();
        const list = (type: string) =>
            platformFetch<PageResult<PlatformRecord>>(`/records/${type}?limit=100`, { signal: c.signal }).catch(() => null);
        Promise.all([list("dispositivos"), list("conexiones")]).then(([d, e]) => {
            if (c.signal.aborted || !d) return;
            const edges = e?.items || [];
            const total = d.items.reduce((n, r) => n + (Number(r.datos.puertos) || 0), 0);
            const used = d.items.reduce((n, r) => n + portsUsed(r, edges), 0);
            setCounts({
                devices: d.total,
                links: edges.filter((x) => x.estado !== "INACTIVO").length,
                inactive: edges.filter((x) => x.estado === "INACTIVO").length,
                occupancy: total ? Math.round((used / total) * 100) : undefined,
                stale: d.items.filter((r) => {
                    const days = daysFromToday(r.datos.ultimaRevision);
                    return days === null || days < -180;
                }).length,
            });
        });
        return () => c.abort();
    }, [revision]);
    const items = [
        { tab: "dispositivos", label: "Dispositivos", value: counts.devices, hint: "Registrados en la red", tone: "info" },
        { tab: "conexiones", label: "Enlaces activos", value: counts.links, hint: counts.inactive ? `${counts.inactive} inactivos` : "Todos activos", tone: "neutral" },
        { tab: "mapa", label: "Ocupación de puertos", value: counts.occupancy === undefined ? undefined : counts.occupancy + "%", hint: "Puertos con enlace", tone: (counts.occupancy || 0) > 85 ? "danger" : "neutral" },
        { tab: "dispositivos", label: "Sin revisión reciente", value: counts.stale, hint: "Más de 180 días o sin registro", tone: counts.stale ? "warning" : "neutral" },
    ];
    return (
        <div className={tiles.overview} role="group" aria-label="Resumen de la red">
            {items.map((t) => (
                <button key={t.label} type="button" className={tiles.tile} data-tone={t.tone} onClick={() => onSelect(t.tab)}>
                    <span className={tiles.tileLabel}>{t.label}</span>
                    <strong>{t.value ?? "—"}</strong>
                    <small>{t.hint}</small>
                </button>
            ))}
        </div>
    );
}
export default NetworkOverview;
