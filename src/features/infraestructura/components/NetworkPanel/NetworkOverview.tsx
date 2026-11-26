"use client";
import { usePlatformQueries } from "@/platform/query";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { daysFromToday } from "../AssetsPanel/assetDates";
import { portsUsed } from "./networkStyle";
import tiles from "../AssetsPanel/AssetsPanel.module.scss";

/** Resumen de la red: tamaño, enlaces activos, ocupación de puertos y revisiones pendientes. */
export function NetworkOverview({
    revision = 0,
    onSelect,
}: {
    revision?: number;
    onSelect: (tab: string) => void;
}) {
    const lists = usePlatformQueries<PageResult<PlatformRecord>>(
        ["/records/dispositivos?limit=100", "/records/conexiones?limit=100"],
        { revision },
    );
    const [d, e] = lists.data;
    const edges = e?.items || [];
    const totalPorts = d ? d.items.reduce((n, r) => n + (Number(r.datos.puertos) || 0), 0) : 0;
    const usedPorts = d ? d.items.reduce((n, r) => n + portsUsed(r, edges), 0) : 0;
    const counts = d
        ? {
              devices: d.total,
              links: edges.filter((x) => x.estado !== "INACTIVO").length,
              inactive: edges.filter((x) => x.estado === "INACTIVO").length,
              occupancy: totalPorts ? Math.round((usedPorts / totalPorts) * 100) : undefined,
              stale: d.items.filter((r) => {
                  const days = daysFromToday(r.datos.ultimaRevision);
                  return days === null || days < -180;
              }).length,
          }
        : ({} as {
              devices?: number;
              links?: number;
              inactive?: number;
              occupancy?: number;
              stale?: number;
          });
    const items = [
        {
            tab: "dispositivos",
            label: "Dispositivos",
            value: counts.devices,
            hint: "Registrados en la red",
            tone: "info",
        },
        {
            tab: "conexiones",
            label: "Enlaces activos",
            value: counts.links,
            hint: counts.inactive ? `${counts.inactive} inactivos` : "Todos activos",
            tone: "neutral",
        },
        {
            tab: "mapa",
            label: "Ocupación de puertos",
            value: counts.occupancy === undefined ? undefined : counts.occupancy + "%",
            hint: "Puertos con enlace",
            tone: (counts.occupancy || 0) > 85 ? "danger" : "neutral",
        },
        {
            tab: "dispositivos",
            label: "Sin revisión reciente",
            value: counts.stale,
            hint: "Más de 180 días o sin registro",
            tone: counts.stale ? "warning" : "neutral",
        },
    ];
    return (
        <div className={tiles.overview} role="group" aria-label="Resumen de la red">
            {items.map((t) => (
                <button
                    key={t.label}
                    type="button"
                    className={tiles.tile}
                    data-tone={t.tone}
                    onClick={() => onSelect(t.tab)}
                >
                    <span className={tiles.tileLabel}>{t.label}</span>
                    <strong>{t.value ?? "—"}</strong>
                    <small>{t.hint}</small>
                </button>
            ))}
        </div>
    );
}
export default NetworkOverview;
