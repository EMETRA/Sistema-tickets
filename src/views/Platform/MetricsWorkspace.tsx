"use client";
import { guatemalaDay } from "@/platform/dates";
import { useCallback, useEffect, useRef, useState, useEffectEvent } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PeriodFilter, formatPeriod } from "@/components/client/molecules/PeriodFilter";
import local from "./MetricsWorkspace.module.scss";
import { OperationsSummary } from "@/features/infraestructura/components/OperationsSummary";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/helpers/displayDate";
import { TicketTagReport } from "./TicketTagReport";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import { metricsQuery, metricOperation, type MetricsSelection } from "@/platform/metrics";
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
        [selection, setSelection] = useState<MetricsSelection>({
            from: guatemalaDay(new Date(Date.now() - 30 * 86400000)),
            to: guatemalaDay(),
            // Administración abre con su equipo de Informática, no con «Mis métricas».
            team: data?.capabilities.teamMetrics && data.actor.admin ? data.defaultTicketTeamId || "" : "",
        }),
        [metrics, setMetrics] = useState<Metrics | null>(null),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [offset, setOffset] = useState(0);
    const request = useRef<AbortController | null>(null);
    const current = useRef(selection);
    const [section, setSection] = useState<"activity" | "labels">("activity");
    const [applied, setApplied] = useState<MetricsSelection | null>(null);
    async function load(page = 0, next: MetricsSelection = selection) {
        let path: string;
        try {
            path = metricsQuery(next, page);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Selecciona un periodo válido.");
            return;
        }
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setLoading(true);
        setError("");
        try {
            const result = await platformFetch<Metrics>(path, {
                signal: AbortSignal.any([controller.signal, AbortSignal.timeout(45000)]),
            });
            if (!result.tickets || !Array.isArray(result.aplicaciones) || !Array.isArray(result.registros))
                throw Error("No se pudo interpretar el reporte de métricas.");
            if (controller.signal.aborted) return;
            setMetrics(result);
            setApplied(next);
            setOffset(page);
        } catch (e) {
            if (!controller.signal.aborted)
                setError(e instanceof Error ? e.message : "No se pudieron cargar las métricas.");
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }
    // Carga inicial con el periodo por defecto; después cada filtro se aplica al cambiar.
    const loadOnMount = useEffectEvent(() => void load());
    useEffect(() => {
        loadOnMount();
        const current = request;
        return () => current.current?.abort();
    }, []);
    // Cada filtro se aplica al cambiar; la última selección vive en un ref
    // para que el callback del periodo sea estable.
    const apply = useCallback((patch: Partial<MetricsSelection>) => {
        const next = { ...current.current, ...patch };
        current.current = next;
        setSelection(next);
        void load(0, next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const applyPeriod = useCallback((from: string, to: string) => apply({ from, to }), [apply]);
    const teams = (data?.teams || []).filter(
        (t) =>
            data!.actor.admin ||
            data!.memberships.some((m) => m.equipoId === t.id && m.funcion === "JEFATURA"),
    );
    const scopeName = (team: string) =>
        team ? teams.find((t) => t.id === team)?.nombre || "Equipo seleccionado" : "Mis métricas";
    const sections = data?.actor.admin && (
        <nav className={styles.tabs} aria-label="Secciones de métricas">
            <button
                type="button"
                aria-current={section === "activity" ? "page" : undefined}
                onClick={() => setSection("activity")}
            >
                Atención y actividad
            </button>
            <button
                type="button"
                aria-current={section === "labels" ? "page" : undefined}
                onClick={() => setSection("labels")}
            >
                Por técnico y etiqueta
            </button>
        </nav>
    );
    if (section === "labels" && data?.actor.admin)
        return (
            <section className={styles.page}>
                {sections}
                <TicketTagReport />
            </section>
        );
    const t = metrics?.tickets;
    const others = t ? Math.max(0, t.total - t.resueltos - t.enTrabajo - t.asignados) : 0;
    const parts = t
        ? [
              { key: "resueltos", label: "Resueltos", value: t.resueltos },
              { key: "atencion", label: "En atención", value: t.enTrabajo },
              { key: "asignados", label: "Asignados", value: t.asignados },
              { key: "otros", label: "Sin asignar u otros", value: others },
          ]
        : [];
    const share = (v: number) => (t && t.total ? Math.round((v / t.total) * 100) : 0);
    const operations = [...(metrics?.aplicaciones || [])].sort((a, b) => b.cantidad - a.cantidad);
    const maxOperation = Math.max(1, ...operations.map((o) => o.cantidad));
    const totalRecords = metrics ? (metrics.totalRegistros ?? metrics.registros.length) : 0;
    return (
        <section className={styles.page}>
            {sections}
            {/* Título accesible; visualmente lo cubren el h1 y la pestaña activa. */}
            <h2 className={styles.srOnly}>Métricas de atención y actividad</h2>
            <div className={local.filters} role="search" aria-label="Filtros de métricas">
                <PeriodFilter from={selection.from} to={selection.to} onChange={applyPeriod} />
                {data!.capabilities.teamMetrics && (
                    <label className={local.scope}>
                        <span>Alcance</span>
                        <select value={selection.team} onChange={(e) => apply({ team: e.target.value })}>
                            <option value="">Mis métricas</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.nombre}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <Button
                    variant="outlined"
                    className={local.refresh}
                    state={loading ? "loading" : "default"}
                    onClick={() => void load(0, applied || selection)}
                >
                    Actualizar
                </Button>
            </div>
            <p className={local.caption} role="status">
                {loading
                    ? "Consultando métricas…"
                    : applied
                      ? `${formatPeriod(applied.from, applied.to)} · ${scopeName(applied.team)} · Hora de Guatemala`
                      : ""}
            </p>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                    {metrics && " Se conservan los resultados de la última consulta."}
                </p>
            )}
            {metrics && t && (
                <div className={local.results} aria-busy={loading}>
                    <section className={local.panel} aria-labelledby="metricas-tickets">
                        <header className={local.panelHeader}>
                            <h3 id="metricas-tickets">Tickets creados en el periodo</h3>
                            <p>Estado actual de las solicitudes registradas en estas fechas.</p>
                        </header>
                        <dl className={local.kpis}>
                            <div className={local.kpiMain}>
                                <dt>Tickets creados</dt>
                                <dd>{t.total}</dd>
                            </div>
                            {parts.slice(0, 3).map((part) => (
                                <div key={part.key}>
                                    <dt>
                                        <span
                                            className={local.swatch}
                                            data-part={part.key}
                                            aria-hidden="true"
                                        />
                                        {part.label}
                                    </dt>
                                    <dd>
                                        {part.value}
                                        {t.total > 0 && <small>{share(part.value)}%</small>}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        {t.total > 0 && (
                            <div className={local.distribution}>
                                <div
                                    className={local.bar}
                                    role="img"
                                    aria-label={
                                        "Distribución: " +
                                        parts
                                            .map((p) => `${p.label} ${p.value} (${share(p.value)}%)`)
                                            .join(", ")
                                    }
                                >
                                    {parts
                                        .filter((p) => p.value > 0)
                                        .map((p) => (
                                            <span
                                                key={p.key}
                                                data-part={p.key}
                                                style={{ flexGrow: p.value }}
                                                title={`${p.label}: ${p.value} (${share(p.value)}%)`}
                                            />
                                        ))}
                                </div>
                                <ul className={local.legend}>
                                    {parts.map((p) => (
                                        <li key={p.key}>
                                            <span
                                                className={local.swatch}
                                                data-part={p.key}
                                                aria-hidden="true"
                                            />
                                            {p.label} <strong>{p.value}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                    <section className={local.panel} aria-labelledby="metricas-operaciones">
                        <header className={local.panelHeader}>
                            <h3 id="metricas-operaciones">Operaciones en aplicaciones</h3>
                            <p>
                                Operaciones confirmadas por cada servicio. Las visitas a pantallas no cuentan.
                            </p>
                        </header>
                        {operations.length ? (
                            <ol className={local.ranking}>
                                {operations.map((item) => (
                                    <li
                                        key={item.aplicacionId + item.operacion}
                                        title={`${metricOperation(item.operacion)} · ${item.aplicacionNombre || "Aplicación autorizada"}: ${item.cantidad}`}
                                    >
                                        <div className={local.rankingText}>
                                            <span>{metricOperation(item.operacion)}</span>
                                            <small>{item.aplicacionNombre || "Aplicación autorizada"}</small>
                                        </div>
                                        <div className={local.rankingTrack} aria-hidden="true">
                                            <span
                                                style={{ width: `${(item.cantidad / maxOperation) * 100}%` }}
                                            />
                                        </div>
                                        <strong>{item.cantidad}</strong>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className={local.empty}>
                                No hay operaciones confirmadas en este periodo y alcance.
                            </p>
                        )}
                    </section>
                    {applied && <OperationsSummary from={applied.from} to={applied.to} />}
                    <section className={local.panel + " " + local.wide} aria-labelledby="actividad">
                        <header className={local.panelHeader + " " + local.panelHeaderRow}>
                            <div>
                                <h3 id="actividad">Registros que forman los indicadores</h3>
                                <p>
                                    {totalRecords} {totalRecords === 1 ? "registro" : "registros"} · páginas
                                    de hasta {metrics.limiteDetalle}
                                </p>
                            </div>
                        </header>
                        <div className={styles.tableRegion + " " + local.flush}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Aplicación</th>
                                        <th>Operación</th>
                                        <th>Referencia</th>
                                        <th className={local.num}>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.registros.map((item) => (
                                        <tr key={item.id}>
                                            <td className={local.nowrap}>{displayDate(item.fecha)}</td>
                                            <td>{item.aplicacionNombre || "Aplicación autorizada"}</td>
                                            <td>{metricOperation(item.operacion)}</td>
                                            <td>{item.recurso}</td>
                                            <td className={local.num}>{item.cantidad}</td>
                                        </tr>
                                    ))}
                                    {!metrics.registros.length && (
                                        <tr>
                                            <td colSpan={5} className={local.emptyCell}>
                                                No hay operaciones registradas para esta consulta.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalRecords > metrics.limiteDetalle && (
                            <footer className={local.pager}>
                                <span>
                                    {offset + 1}–{Math.min(offset + metrics.limiteDetalle, totalRecords)} de{" "}
                                    {totalRecords}
                                </span>
                                <div>
                                    <Button
                                        variant="outlined"
                                        state={offset ? "default" : "disabled"}
                                        onClick={() =>
                                            void load(
                                                Math.max(0, offset - metrics.limiteDetalle),
                                                applied || undefined,
                                            )
                                        }
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        state={
                                            offset + metrics.limiteDetalle < totalRecords
                                                ? "default"
                                                : "disabled"
                                        }
                                        onClick={() =>
                                            void load(offset + metrics.limiteDetalle, applied || undefined)
                                        }
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </footer>
                        )}
                    </section>
                </div>
            )}
        </section>
    );
}
