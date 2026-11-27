"use client";
import Link from "next/link";
import { usePlatformQueries } from "@/platform/query";
import { usePlatform } from "@/platform/context";
import { guatemalaDay } from "@/platform/dates";
import type { PageResult, PlatformRecord } from "@/platform/types";
import tiles from "../AssetsPanel/AssetsPanel.module.scss";
import styles from "./OperationsSummary.module.scss";

type Counts = {
    deploys: number;
    badDeploys: number;
    incidents: number;
    severe: number;
    work: number;
    corrective: number;
    moves: number;
};

/**
 * La operación de Informática dentro del mismo periodo de Métricas
 * (despliegues, incidentes, mantenimientos y movimientos de activos).
 */
export function OperationsSummary({ from, to }: { from: string; to: string }) {
    const { data } = usePlatform();
    const allowed = (type: string) => !!data?.definitions[type]?.actions.LEER;
    const visible = ["despliegues", "incidencias", "intervenciones", "movimientos-activos"].some(allowed);
    const types = ["despliegues", "incidencias", "intervenciones", "movimientos-activos"];
    const lists = usePlatformQueries<PageResult<PlatformRecord>>(
        types.map((t) => (allowed(t) ? `/records/${t}?limit=100` : null)),
        { enabled: visible },
    );
    const inside = (value: unknown) => {
        if (!value) return false;
        const day = /^\d{4}-\d{2}-\d{2}$/.test(String(value))
            ? String(value)
            : guatemalaDay(new Date(String(value)));
        return day >= from && day <= to;
    };
    const [d, i, w, m] = lists.data.map((r) => r?.items ?? []);
    const deploys = d.filter((x) => inside(x.datos.fecha));
    const incidents = i.filter((x) => inside(x.creadoEn));
    const work = w.filter((x) => inside(x.datos.fecha));
    const counts: Counts | null = lists.pending
        ? null
        : {
              deploys: deploys.length,
              badDeploys: deploys.filter((x) => x.datos.resultado !== "CORRECTO").length,
              incidents: incidents.length,
              severe: incidents.filter((x) => ["ALTA", "CRITICA"].includes(String(x.datos.severidad))).length,
              work: work.length,
              corrective: work.filter((x) => x.datos.tipo === "CORRECTIVO").length,
              moves: m.filter((x) => inside(x.datos.fecha)).length,
          };
    if (!visible) return null;
    return (
        <section className={styles.section} aria-labelledby="ops-summary">
            <header>
                <h3 id="ops-summary">Operación de Informática en el periodo</h3>
                <p>
                    Registros del panel con fecha dentro del periodo elegido; no dependen del alcance de
                    tickets.
                </p>
            </header>
            <div className={tiles.overview}>
                <Link
                    href="/espacio/sistemas"
                    className={tiles.tile}
                    data-tone={counts?.badDeploys ? "warning" : "info"}
                >
                    <span className={tiles.tileLabel}>Despliegues</span>
                    <strong>{counts?.deploys ?? "—"}</strong>
                    <small>{counts ? `${counts.badDeploys} fallidos o revertidos` : "Consultando…"}</small>
                </Link>
                <Link
                    href="/espacio/sistemas"
                    className={tiles.tile}
                    data-tone={counts?.severe ? "danger" : "neutral"}
                >
                    <span className={tiles.tileLabel}>Incidentes registrados</span>
                    <strong>{counts?.incidents ?? "—"}</strong>
                    <small>{counts ? `${counts.severe} altos o críticos` : "Consultando…"}</small>
                </Link>
                <Link
                    href="/espacio/inventario?view=mantenimientos"
                    className={tiles.tile}
                    data-tone="neutral"
                >
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
