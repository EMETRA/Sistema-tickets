"use client";
import { startTransition, useEffect, useId, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { platformFetch } from "@/platform/client";
import {
    executionLabel,
    gib,
    healthLabel,
    logMessage,
    matchesContainer,
    needsAttention,
    uptime,
    usagePercent,
    type ContainerFilter,
    type ServerSnapshot,
} from "@/platform/monitoring";
import { displayDate } from "../ResourceWorkspace/RecordDetail";
import common from "../../templates/PlatformPage/PlatformPage.module.scss";
import styles from "./ServerMonitor.module.scss";

function Metric({
    label,
    value,
    detail,
    percent,
}: {
  label: string;
  value: string;
  detail: string;
  percent?: number | null;
}) {
    return (
        <article className={styles.metric}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
            {percent !== undefined && percent !== null && (
                <meter aria-label={label} min={0} max={100} value={percent}>
                    {percent.toFixed(1)} %
                </meter>
            )}
        </article>
    );
}
export function ServerMonitor({
    active,
    canReadLogs,
}: {
  active: boolean;
  canReadLogs: boolean;
}) {
    const [server, setServer] = useState("");
    const [snapshot, setSnapshot] = useState<ServerSnapshot | null>(null);
    const [revision, setRevision] = useState(0);
    const [logs, setLogs] = useState(false);
    const [logsLoaded, setLogsLoaded] = useState(false);
    const [selected, setSelected] = useState("");
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<ContainerFilter>("todos");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const searchId = useId(),
        logId = useId();
    const requestLogs = logs && canReadLogs;
    useEffect(() => {
        if (!server || !active) return;
        const controller = new AbortController();
        startTransition(() => {
            setLoading(true);
            setError("");
        });
        platformFetch<ServerSnapshot>(
            "/monitor/" + server + (requestLogs ? "?logs=1" : ""),
            { signal: controller.signal },
        )
            .then((value) => {
                if (!controller.signal.aborted) {
                    setSnapshot(value);
                    setLogsLoaded(requestLogs);
                }
            })
            .catch((error) => {
                if (!controller.signal.aborted) setError(error.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [server, requestLogs, revision, active]);
    useEffect(() => {
        if (!server || !active) return;
        const timer = setInterval(() => {
            if (document.visibilityState === "visible")
                setRevision((value) => value + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, [server, active]);
    const containers = snapshot?.contenedores || [];
    const visible = containers.filter((c) => matchesContainer(c, query, filter));
    const running = containers.filter((c) => c.estado === "running").length;
    const attention = containers.filter(needsAttention).length;
    const stopped = containers.filter((c) =>
        ["exited", "paused", "created"].includes(c.estado),
    ).length;
    const metrics = snapshot?.metricas;
    const memory = usagePercent(
        metrics?.memoriaUsadaBytes,
        metrics?.memoriaTotalBytes,
    );
    const disk = usagePercent(metrics?.discoUsadoBytes, metrics?.discoTotalBytes);
    const current = containers.find((c) => c.nombre === selected);
    const stale = snapshot?.estado === "DESACTUALIZADO";
    const showLogs = (name: string) => {
        setSelected(name);
        setLogs(true);
    };
    return (
        <div className={styles.monitor}>
            <section className={styles.overview} aria-label="Servidor y observación">
                <div className={styles.serverPicker}>
                    <PlatformField
                        field={{
                            key: "servidorId",
                            label: "Servidor",
                            type: "ref",
                            resource: "servidores",
                        }}
                        value={server}
                        onChange={(value) => {
                            setServer(String(value));
                            setSnapshot(null);
                            setSelected("");
                            setLogs(false);
                            setLogsLoaded(false);
                            setError("");
                            setLoading(false);
                            setQuery("");
                            setFilter("todos");
                        }}
                    />
                </div>
                <div className={styles.observation}>
                    <span className={styles.eyebrow}>ESTADO OBSERVADO</span>
                    <div className={styles.stateLine}>
                        <span
                            className={styles.dot}
                            data-tone={
                                !snapshot?.disponible
                                    ? "neutral"
                                    : stale
                                        ? "warning"
                                        : "success"
                            }
                        />
                        <strong>
                            {!server
                                ? "Elige un servidor"
                                : !snapshot
                                    ? "Consultando servidor"
                                    : !snapshot.disponible
                                        ? "Sin mediciones"
                                        : stale
                                            ? "Mediciones desactualizadas"
                                            : "Observador conectado"}
                        </strong>
                    </div>
                    <p>
                        {snapshot?.observadoEn
                            ? "Última observación: " + displayDate(snapshot.observadoEn)
                            : "Las mediciones aparecerán al recibir una observación del servidor."}
                    </p>
                    <span>Actualización cada minuto · Solo lectura</span>
                </div>
                <Button
                    variant="outlined"
                    state={!server || loading ? "disabled" : "default"}
                    onClick={() => setRevision((value) => value + 1)}
                >
                    {loading ? "Consultando…" : "Actualizar mediciones"}
                </Button>
            </section>
            {error && (
                <div role="alert" className={common.error}>
                    {error}{" "}
                    {snapshot &&
            "Se conserva la última observación; no confirma el estado actual."}
                </div>
            )}
            {loading && (
                <p role="status" className={common.muted}>
                    Consultando observaciones…
                </p>
            )}
            {stale && (
                <p role="status" className={styles.notice}>
                    El observador lleva más tiempo del permitido sin reportar. Estas
                    mediciones no confirman el estado actual del servidor.
                </p>
            )}
            {!server && (
                <section className={styles.empty}>
                    <WorkspaceIcon name="layer-group-solid" size={36} />
                    <h2>Tu infraestructura, en un solo lugar</h2>
                    <p>
                        Selecciona un servidor para revisar sus recursos, contenedores y
                        logs autorizados.
                    </p>
                </section>
            )}
            {snapshot && !snapshot.disponible && (
                <section className={styles.empty}>
                    <h2>Esperando la primera observación</h2>
                    <p>
                        El servidor está registrado. Comprueba que su observador esté
                        instalado y programado para enviar mediciones.
                    </p>
                </section>
            )}
            {metrics && (
                <section className={styles.metrics} aria-label="Recursos del servidor">
                    <Metric
                        label="CPU"
                        value={
                            metrics.cpuPorcentaje === undefined
                                ? "No informado"
                                : metrics.cpuPorcentaje.toFixed(1) + " %"
                        }
                        detail="Uso del procesador"
                        percent={metrics.cpuPorcentaje}
                    />
                    <Metric
                        label="Memoria"
                        value={memory === null ? "No informado" : memory.toFixed(1) + " %"}
                        detail={
                            memory === null
                                ? "Sin medición de memoria"
                                : `${gib(metrics.memoriaUsadaBytes)} de ${gib(metrics.memoriaTotalBytes)} GiB`
                        }
                        percent={memory}
                    />
                    <Metric
                        label="Disco"
                        value={disk === null ? "No informado" : disk.toFixed(1) + " %"}
                        detail={
                            disk === null
                                ? "Sin medición de disco"
                                : `${gib(metrics.discoUsadoBytes)} de ${gib(metrics.discoTotalBytes)} GiB`
                        }
                        percent={disk}
                    />
                    <Metric
                        label="Tiempo activo"
                        value={uptime(metrics.uptimeSegundos)}
                        detail="Desde el último inicio del servidor"
                    />
                </section>
            )}
            {snapshot?.disponible && (
                <section className={styles.panel} aria-label="Contenedores observados">
                    <header className={styles.panelHeader}>
                        <div>
                            <h2>
                                Contenedores{" "}
                                <span className={styles.count}>{containers.length}</span>
                            </h2>
                            <p>Ejecución y salud se muestran por separado.</p>
                        </div>
                        <div className={styles.search}>
                            <label htmlFor={searchId}>Buscar contenedor</label>
                            <input
                                id={searchId}
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Nombre, imagen o versión"
                            />
                        </div>
                    </header>
                    <div className={styles.filters} aria-label="Filtrar contenedores">
                        {(
              [
                  ["todos", "Todos", containers.length],
                  ["running", "En ejecución", running],
                  ["atencion", "Requieren atención", attention],
                  ["detenidos", "Detenidos o en pausa", stopped],
              ] as const
                        ).map(([key, label, total]) => (
                            <button
                                key={key}
                                aria-pressed={filter === key}
                                onClick={() => setFilter(key)}
                            >
                                {label} <span>{total}</span>
                            </button>
                        ))}
                    </div>
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Contenedor</th>
                                    <th>Ejecución</th>
                                    <th>Comprobación de salud</th>
                                    <th>Imagen / versión</th>
                                    {canReadLogs && (
                                        <th>
                                            <span className={styles.srOnly}>Acciones</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((c) => (
                                    <tr key={c.nombre}>
                                        <td>
                                            <strong>{c.nombre}</strong>
                                        </td>
                                        <td>
                                            <span
                                                className={styles.badge}
                                                data-tone={
                                                    ["dead", "restarting"].includes(c.estado)
                                                        ? "danger"
                                                        : c.estado === "running"
                                                            ? "success"
                                                            : "neutral"
                                                }
                                            >
                                                {executionLabel(c.estado)}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={styles.health}
                                                data-tone={
                                                    c.salud === "unhealthy"
                                                        ? "danger"
                                                        : c.salud === "healthy"
                                                            ? "success"
                                                            : "neutral"
                                                }
                                            >
                                                <span className={styles.dot} />
                                                {healthLabel(c.salud)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.image}>
                                                {c.imagen || "Sin imagen informada"}
                                            </span>
                                            {c.version && (
                                                <small title={c.version}>
                                                    {c.version.slice(0, 12)}
                                                </small>
                                            )}
                                        </td>
                                        {canReadLogs && (
                                            <td>
                                                <button
                                                    className={styles.textButton}
                                                    onClick={() => showLogs(c.nombre)}
                                                    aria-label={"Ver logs de " + c.nombre}
                                                >
                                                    Ver logs
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!visible.length && (
                        <p className={styles.emptyTable}>
                            {containers.length
                                ? "No hay contenedores que coincidan con la búsqueda y el filtro."
                                : "El observador no informó contenedores."}
                        </p>
                    )}
                    <footer className={styles.tableFooter}>
                        {visible.length} de {containers.length} contenedores · Sin
                        comprobación significa que no se informó un healthcheck.
                    </footer>
                </section>
            )}
            {snapshot?.disponible && canReadLogs && (
                <section className={styles.panel} aria-label="Logs del contenedor">
                    <header className={styles.panelHeader}>
                        <div>
                            <h2>Logs del contenedor</h2>
                            <p>
                                Últimos cinco minutos · Hasta 100 líneas por contenedor ·
                                Extracto saneado
                            </p>
                        </div>
                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                checked={logs}
                                onChange={(event) => setLogs(event.target.checked)}
                            />
                            Consultar logs autorizados
                        </label>
                    </header>
                    {!logs ? (
                        <p className={styles.logHint}>
                            Activa la consulta o utiliza «Ver logs» en un contenedor. La
                            lectura debe estar habilitada en el observador del servidor.
                        </p>
                    ) : (
                        <div className={styles.logBody}>
                            <div className={styles.logToolbar}>
                                <label htmlFor={logId}>Contenedor</label>
                                <select
                                    id={logId}
                                    value={selected}
                                    onChange={(event) => setSelected(event.target.value)}
                                >
                                    <option value="">Seleccionar contenedor…</option>
                                    {containers.map((c) => (
                                        <option key={c.nombre} value={c.nombre}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                                <span>
                                    {snapshot.observadoEn &&
                    "Observación: " + displayDate(snapshot.observadoEn)}
                                </span>
                            </div>
                            {!logsLoaded ? (
                                <p role="status" className={styles.logHint}>
                                    Solicitando extractos autorizados…
                                </p>
                            ) : !selected ? (
                                <p className={styles.logHint}>
                                    Selecciona el contenedor que deseas consultar.
                                </p>
                            ) : logMessage(current) ? (
                                <p role="status" className={styles.logHint}>
                                    {logMessage(current)}
                                </p>
                            ) : (
                                <pre
                                    className={styles.log}
                                    aria-label={"Logs de " + selected}
                                    tabIndex={0}
                                >
                                    {current?.logs}
                                </pre>
                            )}
                        </div>
                    )}
                    <footer className={styles.tableFooter}>
                        Los extractos corresponden a la última observación recibida. No son
                        una consola en tiempo real.
                    </footer>
                </section>
            )}
        </div>
    );
}
