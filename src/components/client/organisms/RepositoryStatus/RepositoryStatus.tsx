"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";

type Snapshot = {
    disponible: boolean;
    estado: string;
    repositorio: string;
    url: string;
    rama: string;
    consultadoEn: string;
    archivado?: boolean;
    ultimoCommit?: {
        sha: string;
        mensaje: string;
        fecha: string | null;
        url: string;
    };
    comprobaciones?: {
        disponible: boolean;
        total?: number;
        items: { nombre: string; estado: string; resultado: string | null }[];
    };
    pullRequests?: {
        disponible: boolean;
        limitado?: boolean;
        items: {
            numero: number;
            titulo: string;
            borrador: boolean;
            url: string;
        }[];
    };
};
const states: Record<string, string> = {
    SIN_CREDENCIAL:
        "La consulta de GitHub todavía no está conectada. Informática debe completar su configuración.",
    SIN_ACCESO:
        "GitHub no autorizó la consulta. Revisa el acceso de la integración al repositorio.",
    NO_ENCONTRADO_O_SIN_ACCESO:
        "El repositorio o la rama no está disponible para la integración. Comprueba el vínculo, la rama y sus permisos.",
    LIMITE_GITHUB: "GitHub alcanzó su límite de consultas. Intenta más tarde.",
    NO_DISPONIBLE:
        "No se pudo consultar GitHub. Conserva el vínculo y vuelve a intentar.",
};
function checkName(item: { estado: string; resultado: string | null }) {
    if (item.estado !== "completed")
        return item.estado === "in_progress" ? "En ejecución" : "Pendiente";
    return (
        (
            {
                success: "Correcta",
                failure: "Fallida",
                cancelled: "Cancelada",
                skipped: "Omitida",
                neutral: "Neutral",
                timed_out: "Tiempo agotado",
                action_required: "Requiere atención",
            } as Record<string, string>
        )[item.resultado || ""] || "Finalizada sin resultado informado"
    );
}
export function RepositoryStatus({ initialId = "" }: { initialId?: string }) {
    const [id, setId] = useState<unknown>(initialId),
        [snapshot, setSnapshot] = useState<Snapshot | null>(null),
        [revision, setRevision] = useState(0),
        [loading, setLoading] = useState(false),
        [error, setError] = useState("");
    useEffect(() => {
        startTransition(() => {
            setSnapshot(null);
            setError("");
            setLoading(!!id);
        });
        if (!id) return;
        const c = new AbortController();
        platformFetch<Snapshot>("/repositories/" + id, { signal: c.signal })
            .then((value) => {
                if (!c.signal.aborted) setSnapshot(value);
            })
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            })
            .finally(() => {
                if (!c.signal.aborted) setLoading(false);
            });
        return () => c.abort();
    }, [id, revision]);
    return (
        <section
            className={styles.page}
            aria-label="Estado de repositorios vinculados"
        >
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <PlatformField
                        field={{
                            key: "repositorioId",
                            label: "Repositorio vinculado",
                            type: "ref",
                            resource: "repositorios",
                        }}
                        value={id}
                        onChange={setId}
                    />
                </div>
                <Button
                    variant="outlined"
                    state={!id ? "disabled" : loading ? "loading" : "default"}
                    onClick={() => setRevision((n) => n + 1)}
                >
                    Consultar GitHub
                </Button>
            </div>
            {!id && (
                <p className={styles.card}>
                    Selecciona un repositorio registrado para consultar la rama,
                    el último commit, las comprobaciones y sus pull requests.
                </p>
            )}
            {loading && <p role="status">Consultando el repositorio…</p>}
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
            {snapshot && (
                <>
                    <section className={styles.card}>
                        <h2>{snapshot.repositorio}</h2>
                        <p>
                            Rama: <strong>{snapshot.rama}</strong>
                            {snapshot.archivado
                                ? " · Repositorio archivado"
                                : ""}
                        </p>
                        <p className={styles.muted}>
                            Consultado: {displayDate(snapshot.consultadoEn)}
                        </p>
                        {!snapshot.disponible ? (
                            <p role="status">
                                {states[snapshot.estado] ||
                                    states.NO_DISPONIBLE}
                            </p>
                        ) : (
                            snapshot.ultimoCommit && (
                                <>
                                    <h3>Último commit de la rama</h3>
                                    <p>{snapshot.ultimoCommit.mensaje}</p>
                                    <p>
                                        <a
                                            className={styles.link}
                                            href={snapshot.ultimoCommit.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {snapshot.ultimoCommit.sha.slice(
                                                0,
                                                12,
                                            )}
                                        </a>{" "}
                                        ·{" "}
                                        {displayDate(
                                            snapshot.ultimoCommit.fecha,
                                        )}
                                    </p>
                                    <p className={styles.muted}>
                                        La versión que ejecuta cada servidor se
                                        consulta en Infraestructura y en los
                                        despliegues registrados.
                                    </p>
                                </>
                            )
                        )}
                    </section>
                    {snapshot.disponible && (
                        <div className={styles.grid}>
                            <section className={styles.card}>
                                <h2>Comprobaciones del commit</h2>
                                {!snapshot.comprobaciones?.disponible ? (
                                    <p>
                                        No se pudieron consultar las
                                        comprobaciones. Su resultado no está
                                        confirmado.
                                    </p>
                                ) : !snapshot.comprobaciones.items.length ? (
                                    <p>
                                        Este commit no tiene comprobaciones
                                        registradas.
                                    </p>
                                ) : (
                                    <ul className={styles.timeline}>
                                        {snapshot.comprobaciones.items.map(
                                            (item, index) => (
                                                <li key={index}>
                                                    <strong>
                                                        {item.nombre}
                                                    </strong>
                                                    <p>{checkName(item)}</p>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                                {(snapshot.comprobaciones?.total || 0) > 30 && (
                                    <p className={styles.muted}>
                                        Se muestran 30 de{" "}
                                        {snapshot.comprobaciones?.total}{" "}
                                        comprobaciones.
                                    </p>
                                )}
                            </section>
                            <section className={styles.card}>
                                <h2>Pull requests hacia {snapshot.rama}</h2>
                                {!snapshot.pullRequests?.disponible ? (
                                    <p>
                                        No se pudieron consultar los pull
                                        requests.
                                    </p>
                                ) : !snapshot.pullRequests.items.length ? (
                                    <p>
                                        No hay pull requests abiertos hacia esta
                                        rama.
                                    </p>
                                ) : (
                                    <ul className={styles.timeline}>
                                        {snapshot.pullRequests.items.map(
                                            (item) => (
                                                <li key={item.numero}>
                                                    <a
                                                        className={styles.link}
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        #{item.numero} ·{" "}
                                                        {item.titulo}
                                                    </a>
                                                    {item.borrador && (
                                                        <p>Borrador</p>
                                                    )}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                )}
                                {snapshot.pullRequests?.limitado && (
                                    <p className={styles.muted}>
                                        Se muestran los primeros 30 resultados.
                                    </p>
                                )}
                            </section>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
