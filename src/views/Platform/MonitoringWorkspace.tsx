"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Snapshot = {
    disponible: boolean;
    estado: string;
    observadoEn: string | null;
    metricas: Record<string, number> | null;
    contenedores: {
        nombre: string;
        estado: string;
        salud: string | null;
        imagen: string | null;
        version: string | null;
        logs?: string;
    }[];
};
export function MonitoringWorkspace() {
    const { data } = usePlatform(),
        [tab, setTab] = useState("salud"),
        [server, setServer] = useState<unknown>(""),
        [snapshot, setSnapshot] = useState<Snapshot | null>(null),
        [revision, setRevision] = useState(0),
        [logs, setLogs] = useState(false),
        [selected, setSelected] = useState(""),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false);
    useEffect(() => {
        startTransition(() => {
            setSnapshot(null);
        });
        startTransition(() => {
            setSelected("");
        });
        if (!server) return;
        const c = new AbortController();
        startTransition(() => {
            setLoading(true);
        });
        startTransition(() => {
            setError("");
        });
        platformFetch<Snapshot>(
            "/monitor/" + server + (logs ? "?logs=1" : ""),
            {
                signal: c.signal,
            },
        )
            .then(setSnapshot)
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            })
            .finally(() => {
                if (!c.signal.aborted) setLoading(false);
            });
        return () => c.abort();
    }, [server, logs, revision]);
    useEffect(() => {
        if (!server || tab !== "salud") return;
        const timer = setInterval(() => {
            if (document.visibilityState === "visible")
                setRevision((n) => n + 1);
        }, 60000);
        return () => clearInterval(timer);
    }, [server, tab]);
    return (
        <section className={styles.page}>
            <nav className={styles.tabs}>
                <button
                    aria-current={tab === "salud" ? "page" : undefined}
                    onClick={() => setTab("salud")}
                >
                    Estado observado
                </button>
                <button
                    aria-current={tab === "catalogo" ? "page" : undefined}
                    onClick={() => setTab("catalogo")}
                >
                    Servidores y contenedores
                </button>
            </nav>
            {tab === "catalogo" ? (
                <ResourceWorkspace group="infraestructura" />
            ) : (
                <>
                    <div className={styles.toolbar}>
                        <div className={styles.search}>
                            <PlatformField
                                field={{
                                    key: "servidorId",
                                    label: "Servidor",
                                    type: "ref",
                                    resource: "servidores",
                                }}
                                value={server}
                                onChange={setServer}
                            />
                        </div>
                        <Button
                            variant="outlined"
                            onClick={() => setRevision((n) => n + 1)}
                        >
                            Actualizar mediciones
                        </Button>
                    </div>
                    {!!server && (
                        <p className={styles.muted}>
                            Actualización automática cada minuto mientras esta
                            vista esté abierta.
                        </p>
                    )}
                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                        </p>
                    )}
                    {loading && <p role="status">Consultando observaciones…</p>}
                    {!server && (
                        <p className={styles.card}>
                            Selecciona un servidor autorizado para consultar sus
                            mediciones.
                        </p>
                    )}
                    {snapshot && (
                        <>
                            <div className={styles.card}>
                                <h2>{snapshot.estado.replaceAll("_", " ")}</h2>
                                <p className={styles.muted}>
                                    {snapshot.observadoEn
                                        ? "Última observación: " +
                                          displayDate(snapshot.observadoEn)
                                        : "Todavía no hay un observador conectado a este servidor."}
                                </p>
                                {snapshot.estado === "DESACTUALIZADO" && (
                                    <p className={styles.error}>
                                        Las mediciones están desactualizadas. No
                                        confirman el estado actual del servidor.
                                    </p>
                                )}
                            </div>
                            {snapshot.metricas && (
                                <div className={styles.metrics}>
                                    {[
                                        [
                                            "CPU",
                                            snapshot.metricas.cpuPorcentaje ===
                                            undefined
                                                ? "No informado"
                                                : snapshot.metricas.cpuPorcentaje.toFixed(
                                                      1,
                                                  ) + " %",
                                        ],
                                        [
                                            "Memoria",
                                            snapshot.metricas.memoriaTotalBytes
                                                ? (
                                                      (snapshot.metricas
                                                          .memoriaUsadaBytes ||
                                                          0) / 1073741824
                                                  ).toFixed(1) +
                                                  " / " +
                                                  (
                                                      snapshot.metricas
                                                          .memoriaTotalBytes /
                                                      1073741824
                                                  ).toFixed(1) +
                                                  " GiB"
                                                : "No informado",
                                        ],
                                        [
                                            "Disco",
                                            snapshot.metricas.discoTotalBytes
                                                ? (
                                                      (snapshot.metricas
                                                          .discoUsadoBytes ||
                                                          0) / 1073741824
                                                  ).toFixed(1) +
                                                  " / " +
                                                  (
                                                      snapshot.metricas
                                                          .discoTotalBytes /
                                                      1073741824
                                                  ).toFixed(1) +
                                                  " GiB"
                                                : "No informado",
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className={styles.card}
                                        >
                                            <p className={styles.muted}>
                                                {label}
                                            </p>
                                            <h2>{value}</h2>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className={styles.tableRegion}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Contenedor</th>
                                            <th>Ejecución</th>
                                            <th>Healthcheck</th>
                                            <th>Imagen / versión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {snapshot.contenedores.map((c) => (
                                            <tr key={c.nombre}>
                                                <td>{c.nombre}</td>
                                                <td>{c.estado}</td>
                                                <td>
                                                    {c.salud ||
                                                        "Sin healthcheck informado"}
                                                </td>
                                                <td>
                                                    {c.imagen} {c.version}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {data!.capabilities.logs && (
                                <section className={styles.card}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={logs}
                                            onChange={(e) =>
                                                setLogs(e.target.checked)
                                            }
                                        />{" "}
                                        Consultar extractos de logs autorizados
                                    </label>
                                    {logs && (
                                        <>
                                            <select
                                                aria-label="Contenedor para logs"
                                                className={styles.control}
                                                value={selected}
                                                onChange={(e) =>
                                                    setSelected(e.target.value)
                                                }
                                            >
                                                <option value="">
                                                    Seleccionar contenedor…
                                                </option>
                                                {snapshot.contenedores.map(
                                                    (c) => (
                                                        <option key={c.nombre}>
                                                            {c.nombre}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {selected && (
                                                <pre className={styles.log}>
                                                    {snapshot.contenedores.find(
                                                        (c) =>
                                                            c.nombre ===
                                                            selected,
                                                    )?.logs ||
                                                        "El observador no envió líneas de log para este contenedor."}
                                                </pre>
                                            )}
                                        </>
                                    )}
                                    <p className={styles.muted}>
                                        Extractos de la última observación. El
                                        panel no ejecuta comandos ni reinicia
                                        servicios.
                                    </p>
                                </section>
                            )}
                        </>
                    )}
                </>
            )}
        </section>
    );
}
