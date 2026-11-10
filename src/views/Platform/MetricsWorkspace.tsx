"use client";
import { guatemalaDay } from "@/platform/dates";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { MetricCard } from "@/components/client/molecules/MetricCard";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import { TicketTagReport } from "./TicketTagReport";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import {
    metricsQuery,
    metricOperation,
    type MetricsSelection,
} from "@/platform/metrics";
type Metrics = {
    desde: string;
    hasta: string;
    tickets: {
        total: number;
        resueltos: number;
        enTrabajo: number;
        asignados: number;
    };
    aplicaciones: {
        aplicacionId: string;
        aplicacionNombre?: string;
        operacion: string;
        eventos: number;
        cantidad: number;
    }[];
    registros: {
        id: string;
        aplicacionId: string;
        aplicacionNombre?: string;
        usuarioId: number;
        operacion: string;
        recurso: string;
        cantidad: number;
        fecha: string;
    }[];
    totalRegistros?: number;
    offset?: number;
    limiteDetalle: number;
};
export function MetricsWorkspace() {
    const { data } = usePlatform(),
        [from, setFrom] = useState(
            guatemalaDay(new Date(Date.now() - 30 * 86400000)),
        ),
        [to, setTo] = useState(guatemalaDay()),
        [team, setTeam] = useState(""),
        [metrics, setMetrics] = useState<Metrics | null>(null),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [offset, setOffset] = useState(0);
    const request = useRef<AbortController | null>(null);
    const [section,setSection] = useState<'activity'|'labels'>('activity');
    const [applied, setApplied] = useState<MetricsSelection | null>(null);
    async function load(
        page = 0,
        selection: MetricsSelection = { from, to, team },
    ) {
        let path: string;
        try {
            path = metricsQuery(selection, page);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Selecciona un periodo válido.",
            );
            return;
        }
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setLoading(true);
        setError("");
        try {
            const result = await platformFetch<Metrics>(path, {
                signal: AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(45000),
                ]),
            });
            if (
                !result.tickets ||
                !Array.isArray(result.aplicaciones) ||
                !Array.isArray(result.registros)
            )
                throw Error("No se pudo interpretar el reporte de métricas.");
            if (controller.signal.aborted) return;
            setMetrics(result);
            setApplied(selection);
            setOffset(page);
        } catch (e) {
            if (!controller.signal.aborted)
                setError(
                    e instanceof Error
                        ? e.message
                        : "No se pudieron cargar las métricas.",
                );
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }
    useEffect(() => {
        // La consulta inicial toma el periodo por defecto; los cambios se aplican al pulsar Consultar.
        void load();
        return () => request.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const sections = data?.actor.admin && <nav className={styles.actions} aria-label="Secciones de métricas"><Button variant={section==='activity' ? 'contained' : 'outlined'} aria-pressed={section==='activity'} onClick={()=>setSection('activity')}>Atención y actividad</Button><Button variant={section==='labels' ? 'contained' : 'outlined'} aria-pressed={section==='labels'} onClick={()=>setSection('labels')}>Por técnico y etiqueta</Button></nav>;
    if(section==='labels' && data?.actor.admin) return <section className={styles.page}>{sections}<TicketTagReport/></section>;
    return (
        <section className={styles.page}>
            {sections}
            <div>
                <h2>Métricas de atención y actividad</h2>
                <p className={styles.muted}>
                    Los indicadores de aplicaciones cuentan operaciones
                    confirmadas por sus servicios. Las visitas a pantallas no
                    cuentan como trabajo realizado.
                </p>
            </div>
            <form
                className={styles.toolbar}
                onSubmit={(e) => {
                    e.preventDefault();
                    void load();
                }}
            >
                <div className={styles.actions}>
                    <label className={styles.field}>
                        Desde
                        <input
                            className={styles.control}
                            type="date"
                            required
                            max={to}
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </label>
                    <label className={styles.field}>
                        Hasta
                        <input
                            className={styles.control}
                            type="date"
                            required
                            min={from}
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </label>
                    {data!.capabilities.teamMetrics && (
                        <label className={styles.field}>
                            Alcance
                            <select
                                className={styles.control}
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                            >
                                <option value="">Mis métricas</option>
                                {data!.teams
                                    .filter(
                                        (t) =>
                                            data!.actor.admin ||
                                            data!.memberships.some(
                                                (m) =>
                                                    m.equipoId === t.id &&
                                                    m.funcion === "JEFATURA",
                                            ),
                                    )
                                    .map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre}
                                        </option>
                                    ))}
                            </select>
                        </label>
                    )}
                </div>
                <Button type="submit" state={loading ? "loading" : "default"}>
                    Consultar
                </Button>
            </form>
            {loading && (
                <p role="status" className={styles.muted}>
                    Consultando métricas…
                </p>
            )}
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                    {metrics &&
                        " Se conservan los resultados de la última consulta."}
                </p>
            )}
            {metrics && applied && (
                <p className={styles.muted}>
                    Resultados del {applied.from} al {applied.to} ·{" "}
                    {applied.team
                        ? data?.teams.find((t) => t.id === applied.team)
                              ?.nombre || "Equipo seleccionado"
                        : "Mis métricas"}
                    .
                </p>
            )}
            {metrics && (
                <>
                    <section>
                        <h3>
                            Tickets creados en el periodo y su estado actual
                        </h3>
                        <div className={styles.metrics}>
                            <MetricCard
                                label="Tickets"
                                value={metrics.tickets.total}
                            />
                            <MetricCard
                                label="Resueltos"
                                value={metrics.tickets.resueltos}
                            />
                            <MetricCard
                                label="En atención"
                                value={metrics.tickets.enTrabajo}
                            />
                            <MetricCard
                                label="Asignados"
                                value={metrics.tickets.asignados}
                            />
                        </div>
                    </section>
                    <section className={styles.card}>
                        <h3>Operaciones de aplicaciones</h3>
                        <div className={styles.grid}>
                            {metrics.aplicaciones.map((item) => (
                                <MetricCard
                                    key={item.aplicacionId + item.operacion}
                                    label={metricOperation(item.operacion)}
                                    value={item.cantidad}
                                    caption={
                                        item.aplicacionNombre ||
                                        "Aplicación autorizada"
                                    }
                                />
                            ))}
                        </div>
                        {!metrics.aplicaciones.length && (
                            <p className={styles.muted}>
                                No hay operaciones confirmadas en este periodo y
                                alcance. Puedes cambiar los filtros o volver a
                                consultar después de completar una operación.
                            </p>
                        )}
                    </section>
                    <section>
                        <h3 id="actividad">
                            Registros que forman los indicadores
                        </h3>
                        <div className={styles.tableRegion}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Aplicación</th>
                                        <th>Operación</th>
                                        <th>Referencia</th>
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.registros.map((item) => (
                                        <tr key={item.id}>
                                            <td>{displayDate(item.fecha)}</td>
                                            <td>
                                                {item.aplicacionNombre ||
                                                    "Aplicación autorizada"}
                                            </td>
                                            <td>
                                                {metricOperation(
                                                    item.operacion,
                                                )}
                                            </td>
                                            <td>{item.recurso}</td>
                                            <td>{item.cantidad}</td>
                                        </tr>
                                    ))}
                                    {!metrics.registros.length && (
                                        <tr>
                                            <td colSpan={5}>
                                                No hay operaciones registradas
                                                para esta consulta.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.toolbar}>
                            <p className={styles.muted}>
                                {metrics.totalRegistros ??
                                    metrics.registros.length}{" "}
                                registros · Páginas de hasta{" "}
                                {metrics.limiteDetalle}
                            </p>
                            <div className={styles.actions}>
                                <Button
                                    variant="outlined"
                                    state={offset ? "default" : "disabled"}
                                    onClick={() =>
                                        void load(
                                            Math.max(
                                                0,
                                                offset - metrics.limiteDetalle,
                                            ),
                                            applied || undefined,
                                        )
                                    }
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outlined"
                                    state={
                                        offset + metrics.limiteDetalle <
                                        (metrics.totalRegistros ?? 0)
                                            ? "default"
                                            : "disabled"
                                    }
                                    onClick={() =>
                                        void load(
                                            offset + metrics.limiteDetalle,
                                            applied || undefined,
                                        )
                                    }
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}
