"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { RepositoryStatus } from "@/components/client/organisms/RepositoryStatus/RepositoryStatus";
import { usePlatform } from "@/platform/context";
import { PlatformField } from "@/components/client/molecules/PlatformField/PlatformField";
import { ResourceWorkspace } from "@/components/client/organisms/ResourceWorkspace/ResourceWorkspace";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Objects = {
    owner: string;
    consultadoEn: string;
    alcance: string;
    limite: number;
    objects: {
        nombre: string;
        tipo: string;
        estado: string;
        ultimaModificacion: string;
    }[];
    constraints: {
        tabla: string;
        nombre: string;
        tipo: string;
        estado: string;
        validado: string;
    }[];
};
export function SystemsWorkspace() {
    const { data } = usePlatform();
    const [tab, setTab] = useState("catalogo"),
        [schema, setSchema] = useState<unknown>(""),
        [result, setResult] = useState<Objects | null>(null),
        [query, setQuery] = useState(""),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0);
    useEffect(() => {
        startTransition(() => {
            setResult(null);
        });
        if (!schema) return;
        const c = new AbortController();
        startTransition(() => {
            setError("");
        });
        platformFetch<Objects>("/objects/" + schema, { signal: c.signal })
            .then(setResult)
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            });
        return () => c.abort();
    }, [schema, revision]);
    return (
        <section className={styles.page}>
            <nav className={styles.tabs}>
                <button
                    aria-current={tab === "catalogo" ? "page" : undefined}
                    onClick={() => setTab("catalogo")}
                >
                    Aplicaciones y seguimiento
                </button>
                {!!data?.definitions.repositorios?.actions.LEER && (
                    <button
                        aria-current={
                            tab === "repositorios" ? "page" : undefined
                        }
                        onClick={() => setTab("repositorios")}
                    >
                        Estado de repositorios
                    </button>
                )}
                <button
                    aria-current={tab === "oracle" ? "page" : undefined}
                    onClick={() => setTab("oracle")}
                >
                    Objetos de Oracle
                </button>
            </nav>
            {tab === "catalogo" ? (
                <ResourceWorkspace group="sistemas" />
            ) : tab === "repositorios" ? (
                <RepositoryStatus />
            ) : (
                <>
                    <div className={styles.toolbar}>
                        <div className={styles.search}>
                            <PlatformField
                                field={{
                                    key: "esquemaId",
                                    label: "Esquema registrado",
                                    type: "ref",
                                    resource: "esquemas",
                                }}
                                value={schema}
                                onChange={setSchema}
                            />
                        </div>
                        <Button
                            variant="outlined"
                            onClick={() => setRevision((n) => n + 1)}
                        >
                            Actualizar
                        </Button>
                    </div>
                    {error && (
                        <p className={styles.error} role="alert">
                            {error}
                        </p>
                    )}
                    {result && (
                        <>
                            <p className={styles.muted}>
                                {result.owner} · Consultado{" "}
                                {displayDate(result.consultadoEn)}. Solo se
                                muestran objetos visibles para la cuenta del
                                API; la ausencia de objetos puede indicar
                                permisos pendientes.
                            </p>
                            <label className={styles.search}>
                                Filtrar nombres
                                <input
                                    className={styles.control}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </label>
                            <div className={styles.grid}>
                                <section className={styles.card}>
                                    <h2>Tablas, triggers y objetos</h2>
                                    {result.objects.length ===
                                        result.limite && (
                                        <p className={styles.muted}>
                                            Se alcanzó el límite de{" "}
                                            {result.limite} objetos.
                                        </p>
                                    )}
                                    <div className={styles.tableRegion}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Objeto</th>
                                                    <th>Tipo</th>
                                                    <th>Estado</th>
                                                    <th>Último DDL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.objects
                                                    .filter((o) =>
                                                        o.nombre
                                                            .toLowerCase()
                                                            .includes(
                                                                query.toLowerCase(),
                                                            ),
                                                    )
                                                    .map((o) => (
                                                        <tr
                                                            key={
                                                                o.tipo +
                                                                o.nombre
                                                            }
                                                        >
                                                            <td>{o.nombre}</td>
                                                            <td>{o.tipo}</td>
                                                            <td>{o.estado}</td>
                                                            <td>
                                                                {displayDate(
                                                                    o.ultimaModificacion,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                                <section className={styles.card}>
                                    <h2>Constraints</h2>
                                    {result.constraints.length ===
                                        result.limite && (
                                        <p className={styles.muted}>
                                            Se alcanzó el límite de{" "}
                                            {result.limite} restricciones.
                                        </p>
                                    )}
                                    <div className={styles.tableRegion}>
                                        <table className={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th>Tabla / restricción</th>
                                                    <th>Tipo</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.constraints
                                                    .filter((o) =>
                                                        (
                                                            o.tabla +
                                                            " " +
                                                            o.nombre
                                                        )
                                                            .toLowerCase()
                                                            .includes(
                                                                query.toLowerCase(),
                                                            ),
                                                    )
                                                    .map((o) => (
                                                        <tr key={o.nombre}>
                                                            <td>
                                                                {o.tabla}
                                                                <br />
                                                                {o.nombre}
                                                            </td>
                                                            <td>{o.tipo}</td>
                                                            <td>
                                                                {o.estado} ·{" "}
                                                                {o.validado}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        </>
                    )}
                </>
            )}
        </section>
    );
}
