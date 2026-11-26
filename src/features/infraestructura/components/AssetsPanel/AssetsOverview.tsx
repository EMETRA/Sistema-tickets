"use client";
import { usePlatformQueries } from "@/platform/query";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { daysFromToday, latestByAsset } from "./assetDates";
import styles from "./AssetsPanel.module.scss";

type Counts = { fichas?: number; vencidos?: number; proximos?: number; movimientos?: number };

/** Resumen del espacio de activos: cada indicador lleva a su pestaña. */
export function AssetsOverview({
    onSelect,
    revision = 0,
}: {
    onSelect: (tab: string) => void;
    revision?: number;
}) {
    const lists = usePlatformQueries<PageResult<PlatformRecord>>(
        [
            "/records/activos?limit=1",
            "/records/intervenciones?limit=100",
            "/records/movimientos-activos?limit=100",
        ],
        { revision },
    );
    const [a, i, m] = lists.data;
    const due = i
        ? latestByAsset(i.items)
              .map((r) => daysFromToday(r.datos.proximaRevision))
              .filter((d): d is number => d !== null)
        : [];
    const counts: Counts = {
        fichas: a?.total,
        vencidos: i ? due.filter((d) => d < 0).length : undefined,
        proximos: i ? due.filter((d) => d >= 0 && d <= 30).length : undefined,
        movimientos: m
            ? m.items.filter((r) => (daysFromToday(r.datos.fecha) ?? -99) >= -30).length
            : undefined,
    };
    const tiles = [
        {
            id: "fichas",
            label: "Fichas técnicas",
            value: counts.fichas,
            hint: "Bienes registrados en el panel",
            tone: "info",
        },
        {
            id: "mantenimientos",
            label: "Revisiones vencidas",
            value: counts.vencidos,
            hint: "Pasaron su próxima revisión",
            tone: counts.vencidos ? "danger" : "neutral",
        },
        {
            id: "mantenimientos",
            label: "Próximos 30 días",
            value: counts.proximos,
            hint: "Revisiones por programar",
            tone: "warning",
        },
        {
            id: "movimientos",
            label: "Movimientos · 30 días",
            value: counts.movimientos,
            hint: "Traslados, salidas y bajas",
            tone: "neutral",
        },
    ];
    return (
        <div className={styles.overview} role="group" aria-label="Resumen de activos">
            {tiles.map((t) => (
                <button
                    key={t.label}
                    type="button"
                    className={styles.tile}
                    data-tone={t.tone}
                    onClick={() => onSelect(t.id)}
                >
                    <span className={styles.tileLabel}>{t.label}</span>
                    <strong>{t.value ?? "—"}</strong>
                    <small>{t.hint}</small>
                </button>
            ))}
        </div>
    );
}
export default AssetsOverview;
