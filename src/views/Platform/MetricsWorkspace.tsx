"use client";
import { guatemalaDay } from "@/platform/dates";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { MetricCard } from "@/components/client/molecules/MetricCard";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
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
    async function load(page = 0) {
        setLoading(true);
        setError("");
        try {
            const start = new Date(from + "T00:00:00-06:00"),
                end = new Date(to + "T00:00:00-06:00");
            end.setUTCDate(end.getUTCDate() + 1);
            const result = await platformFetch<Metrics>(
                "/metrics?desde=" +
                    encodeURIComponent(start.toISOString()) +
                    "&hasta=" +
                    encodeURIComponent(end.toISOString()) +
                    (team ? "&equipoId=" + team : "") +
                    "&offset=" +
                    page,
            );
            setMetrics(result);
            setOffset(page);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudieron cargar las métricas.",
            );
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        // La consulta inicial toma el periodo por defecto; los cambios se aplican al pulsar Consultar.
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <section className={styles.page}>
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
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
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
                                    label={item.operacion.replaceAll("_", " ")}
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
                                No hay operaciones de aplicaciones registradas
                                en este periodo. Cada aplicación debe tener
                                conectada su fuente de eventos.
                            </p>
                        )}
                    </section>
                    <section>
                        <h3 id="actividad">Registros que forman los indicadores</h3>
                        <div className={styles.tableRegion}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
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
                                                {item.operacion.replaceAll(
                                                    "_",
                                                    " ",
                                                )}
                                            </td>
                                            <td>{item.recurso}</td>
                                            <td>{item.cantidad}</td>
                                        </tr>
                                    ))}
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
                                        void load(Math.max(0, offset - 100))
                                    }
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outlined"
                                    state={
                                        offset + 100 <
                                        (metrics.totalRegistros ?? 0)
                                            ? "default"
                                            : "disabled"
                                    }
                                    onClick={() => void load(offset + 100)}
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
