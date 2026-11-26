"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { platformFetch } from "@/platform/client";
import { usePlatform } from "@/platform/context";
import { guatemalaDay } from "@/platform/dates";
import type { PageResult, PlatformRecord } from "@/platform/types";
import tiles from "../AssetsPanel/AssetsPanel.module.scss";
import styles from "./OperationsSummary.module.scss";

type Counts = {
    deploys: number; badDeploys: number;
    incidents: number; severe: number;
    work: number; corrective: number;
    moves: number;
};

/**
 * Propuesta: la operación de Informática dentro del mismo periodo de Métricas
 * (despliegues, incidentes, mantenimientos y movimientos de activos).
 */
export function OperationsSummary({ from, to }: { from: string; to: string }) {
    const { data } = usePlatform();
    const [counts, setCounts] = useState<Counts | null>(null);
    const allowed = (type: string) => !!data?.definitions[type]?.actions.LEER;
    const visible = ["despliegues", "incidencias", "intervenciones", "movimientos-activos"].some(allowed);
    useEffect(() => {
        if (!visible) return;
        const c = new AbortController();
        const list = (type: string) =>
            allowed(type)
                ? platformFetch<PageResult<PlatformRecord>>(`/records/${type}?limit=100`, { signal: c.signal }).then((r) => r.items).catch(() => [])
                : Promise.resolve([] as PlatformRecord[]);
        const inside = (value: unknown) => {
            if (!value) return false;
            const day = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? String(value) : guatemalaDay(new Date(String(value)));
            return day >= from && day <= to;
        };
        Promise.all([list("despliegues"), list("incidencias"), list("intervenciones"), list("movimientos-activos")]).then(([d, i, w, m]) => {
            if (c.signal.aborted) return;
            const deploys = d.filter((x) => inside(x.datos.fecha));
            const incidents = i.filter((x) => inside(x.creadoEn));
            const work = w.filter((x) => inside(x.datos.fecha));
            setCounts({
                deploys: deploys.length,
                badDeploys: deploys.filter((x) => x.datos.resultado !== "CORRECTO").length,
                incidents: incidents.length,
                severe: incidents.filter((x) => ["ALTA", "CRITICA"].includes(String(x.datos.severidad))).length,
                work: work.length,
                corrective: work.filter((x) => x.datos.tipo === "CORRECTIVO").length,
                moves: m.filter((x) => inside(x.datos.fecha)).length,
            });
        });
        return () => c.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from, to, visible]);
    if (!visible) return null;
    return (
        <section className={styles.section} aria-labelledby="ops-summary">
            <header>
                <h3 id="ops-summary">Operación de Informática en el periodo</h3>
                <p>Registros del panel con fecha dentro del periodo elegido; no dependen del alcance de tickets.</p>
            </header>
            <div className={tiles.overview}>
                <Link href="/espacio/sistemas" className={tiles.tile} data-tone={counts?.badDeploys ? "warning" : "info"}>
                    <span className={tiles.tileLabel}>Despliegues</span>
                    <strong>{counts?.deploys ?? "—"}</strong>
                    <small>{counts ? `${counts.badDeploys} fallidos o revertidos` : "Consultando…"}</small>
                </Link>
                <Link href="/espacio/sistemas" className={tiles.tile} data-tone={counts?.severe ? "danger" : "neutral"}>
                    <span className={tiles.tileLabel}>Incidentes registrados</span>
                    <strong>{counts?.incidents ?? "—"}</strong>
                    <small>{counts ? `${counts.severe} altos o críticos` : "Consultando…"}</small>
                </Link>
                <Link href="/espacio/inventario?view=mantenimientos" className={tiles.tile} data-tone="neutral">
                    <span className={tiles.tileLabel}>Mantenimientos realizados</span>
                    <strong>{counts?.work ?? "—"}</strong>
                    <small>{counts ? `${counts.corrective} correctivos` : "Consultando…"}</small>
                </Link>
                <Link href="/espacio/inventario?view=movimientos" className={tiles.tile} data-tone="neutral">
                    <span className={tiles.tileLabel}>Movimientos de activos</span>
                    <strong>{counts?.moves ?? "—"}</strong>
                    <small>Traslados, salidas y bajas</small>
                </Link>
            </div>
        </section>
    );
}
export default OperationsSummary;
