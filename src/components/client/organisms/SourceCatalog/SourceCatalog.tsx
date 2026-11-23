"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import { usePlatform } from "@/platform/context";
import type { PlatformRecord } from "@/platform/types";
import { RecordEditor } from "../ResourceWorkspace/RecordEditor";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";

import localStyles from "./SourceCatalog.module.scss";

type Item = {
  owner?: string;
  objetos?: number;
  invalidos?: number;
  nombre?: string;
  nombreCompleto?: string;
  url?: string;
  descripcion?: string;
  ramaPredeterminada?: string;
  privado?: boolean;
  archivado?: boolean;
};
type Catalog = {
  items: Item[];
  disponible?: boolean;
  estado?: string;
  organizaciones?: string[];
  organizacion?: string;
  limitado?: boolean;
  hayMas?: boolean;
};
const errors: Record<string, string> = {
    SIN_CREDENCIAL:
    "GitHub aún no está conectado. Configura la credencial de solo lectura en api-tickets; después vuelve a consultar.",
    SIN_ACCESO:
    "La credencial no tiene acceso a la organización. Revisa sus repositorios autorizados y la autorización de la organización.",
    NO_ENCONTRADO_O_SIN_ACCESO:
    "La organización no está disponible para la integración. Revisa el nombre y su acceso.",
    LIMITE_GITHUB: "GitHub alcanzó el límite de consultas. Intenta más tarde.",
    NO_DISPONIBLE: "No se pudo consultar GitHub. Vuelve a intentar.",
};
export function SourceCatalog({
    kind,
    onLinked,
}: {
  kind: "oracle" | "github";
  onLinked: (record: PlatformRecord) => void;
}) {
    const { data } = usePlatform();
    const [draft, setDraft] = useState(""),
        [query, setQuery] = useState(""),
        [page, setPage] = useState(1),
        [org, setOrg] = useState("");
    const [result, setResult] = useState<Catalog | null>(null),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false),
        [revision, setRevision] = useState(0);
    const [editing, setEditing] = useState<Item | null>(null);
    const type = kind === "oracle" ? "esquemas" : "repositorios";
    useEffect(() => {
        if (!data?.actor.admin) return;
        const c = new AbortController();
        startTransition(() => {
            setLoading(true);
            setError("");
            setResult(null);
        });
        const params = new URLSearchParams({ q: query });
        if (kind === "github") {
            params.set("pagina", String(page));
            if (org) params.set("organizacion", org);
        }
        platformFetch<Catalog>("/sources/" + kind + "?" + params, {
            signal: c.signal,
        })
            .then((value) => {
                if (!Array.isArray(value.items))
                    throw new Error(
                        "La fuente devolvió un formato inesperado. Reintenta la consulta.",
                    );
                if (!c.signal.aborted) setResult(value);
            })
            .catch((e: unknown) => {
                if (!c.signal.aborted)
                    setError(
                        e instanceof Error ? e.message : "No se pudo consultar la fuente",
                    );
            })
            .finally(() => {
                if (!c.signal.aborted) setLoading(false);
            });
        return () => c.abort();
    }, [kind, query, page, org, revision, data?.actor.admin]);
    if (!data?.actor.admin) return null;
    const connected = result && result.disponible !== false;
    return (
        <section
            className={styles.card}
            aria-label={
                kind === "oracle"
                    ? "Esquemas disponibles en Oracle"
                    : "Repositorios disponibles en GitHub"
            }
        >
            <h2>
                {kind === "oracle"
                    ? "Esquemas disponibles en Oracle"
                    : "Repositorios disponibles en GitHub"}
            </h2>
            <p className={styles.muted}>
                {kind === "oracle"
                    ? "Consulta los esquemas de aplicaciones visibles para la cuenta del API, sin vistas DBA ni lectura de datos de sus tablas."
                    : "Consulta los repositorios que autoriza la credencial de la organización. Vincular uno no cambia su código ni sus permisos en GitHub."}
            </p>
            <form
                className={styles.toolbar}
                onSubmit={(e) => {
                    e.preventDefault();
                    setQuery(draft.trim());
                    setPage(1);
                    setRevision((n) => n + 1);
                }}
            >
                {!!result?.organizaciones && result.organizaciones.length > 1 && (
                    <label className={`${styles.search} ${localStyles.queryField}`}>
                        Organización
                        <select
                            className={styles.control}
                            value={org || result.organizacion}
                            onChange={(e) => {
                                setOrg(e.target.value);
                                setPage(1);
                            }}
                        >
                            {result.organizaciones.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                )}
                <label className={`${styles.search} ${localStyles.queryField}`}>
                    {kind === "oracle" ? "Buscar esquema" : "Buscar repositorio"}
                    <input
                        className={styles.control}
                        value={draft}
                        maxLength={kind === "oracle" ? 128 : 100}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={
                            kind === "oracle" ? "Ej. ADMEMETRAIT" : "Ej. api-tickets"
                        }
                    />
                </label>
                <Button
                    type="submit"
                    variant="outlined"
                    state={loading ? "disabled" : "default"}
                >
                    Consultar fuente
                </Button>
            </form>
            {loading && (
                <p role="status">
                    Consultando {kind === "oracle" ? "Oracle" : "GitHub"}…
                </p>
            )}
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {result?.disponible === false && (
                <p role="status" className={localStyles.notice}>
                    {errors[result.estado || ""] || errors.NO_DISPONIBLE}
                </p>
            )}
            {connected && (
                <>
                    {!result.items.length ? (
                        <p role="status">
                            No se encontraron{" "}
                            {kind === "oracle"
                                ? "esquemas visibles"
                                : "repositorios accesibles"}{" "}
                            con este filtro.
                        </p>
                    ) : (
                        <div className={`${styles.tableRegion} ${localStyles.sourceRegion}`}>
                            <table className={`${styles.table} ${localStyles.sourceTable}`}>
                                <caption className={styles.muted}>
                                    {kind === "oracle"
                                        ? "Esquemas de aplicaciones"
                                        : "Repositorios de " + result.organizacion}
                                </caption>
                                <thead>
                                    <tr>
                                        <th>{kind === "oracle" ? "Esquema" : "Repositorio"}</th>
                                        <th>
                                            {kind === "oracle"
                                                ? "Objetos visibles"
                                                : "Rama predeterminada"}
                                        </th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.items.map((item) => (
                                        <tr key={item.owner || item.nombreCompleto}>
                                            <td data-label={kind === "oracle" ? "Esquema" : "Repositorio"}>
                                                {item.url ? (
                                                    <>
                                                        <a
                                                            className={styles.link}
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {item.nombreCompleto}
                                                        </a>
                                                        {item.descripcion && (
                                                            <p className={styles.muted}>{item.descripcion}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <strong>{item.owner}</strong>
                                                )}
                                            </td>
                                            <td data-label={kind === "oracle" ? "Objetos visibles" : "Rama predeterminada"}>
                                                {kind === "oracle"
                                                    ? item.objetos
                                                    : item.ramaPredeterminada || "Sin rama informada"}
                                            </td>
                                            <td data-label="Estado">
                                                {kind === "oracle"
                                                    ? item.invalidos
                                                        ? `${item.invalidos} inválidos`
                                                        : "Sin objetos inválidos"
                                                    : item.archivado
                                                        ? "Archivado"
                                                        : item.privado
                                                            ? "Privado"
                                                            : "Público"}
                                            </td>
                                            <td className={localStyles.linkAction}>
                                                {data.definitions[type]?.actions.INSERTAR && (
                                                    <Button
                                                        variant="outlined"
                                                        aria-label={`Vincular ${item.owner || item.nombreCompleto}`}
                                                        onClick={() => setEditing(item)}
                                                    >
                                                        Vincular a una aplicación
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {result.limitado && (
                        <p className={styles.muted}>
                            Se muestran hasta 100 esquemas. Filtra el nombre para encontrar
                            los restantes.
                        </p>
                    )}
                    {kind === "github" && (
                        <div className={localStyles.pagination}>
                            <Button
                                variant="outlined"
                                state={page === 1 ? "disabled" : "default"}
                                onClick={() => setPage((n) => n - 1)}
                            >
                                Anterior
                            </Button>
                            <span>Página {page}</span>
                            <Button
                                variant="outlined"
                                state={!result.hayMas ? "disabled" : "default"}
                                onClick={() => setPage((n) => n + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    )}
                </>
            )}
            {editing && (
                <RecordEditor
                    type={type}
                    initialName={editing.owner || editing.nombre || ""}
                    initial={
                        kind === "oracle" ? { owner: editing.owner } : { url: editing.url }
                    }
                    onClose={() => setEditing(null)}
                    onSaved={(record) => {
                        setEditing(null);
                        onLinked(record);
                    }}
                />
            )}
            <p className={styles.muted}>
                Al vincular, selecciona la aplicación, el equipo y la visibilidad.{" "}
                {kind === "github" &&
          "Indica la rama realmente desplegada; la rama predeterminada no la confirma."}{" "}
                Se conserva el historial y las confirmaciones administrativas.
            </p>
        </section>
    );
}
