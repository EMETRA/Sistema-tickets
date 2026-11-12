"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import {
    RESOURCE_PRESENTATION,
    resourceDefinition,
    resourceValue,
} from "@/platform/resources";
import { RecordEditor } from "./RecordEditor";
import { RecordDetail, displayDate } from "./RecordDetail";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
export function ResourceWorkspace({
    group,
    initialType,
    types,
    hideTabs = false,
    hideDescription = false,
    scopeEquipoId,
    extraActions,
}: {
    group: string;
    initialType?: string;
    types?: string[];
    hideTabs?: boolean;
    hideDescription?: boolean;
    scopeEquipoId?: string;
    extraActions?: React.ReactNode;
}) {
    const { data } = usePlatform();
    const options = Object.entries(data!.definitions).filter(
        ([id, d]) => d.group === group && (!types || types.includes(id)),
    );
    const [type, setType] = useState(initialType || options[0]?.[0] || ""),
        [query, setQuery] = useState(""),
        [offset, setOffset] = useState(0),
        [result, setResult] = useState<PageResult<PlatformRecord>>({
            items: [],
            total: 0,
            offset: 0,
            limit: 25,
        }),
        [loading, setLoading] = useState(true),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0),
        [selected, setSelected] = useState<PlatformRecord | null>(null),
        [editing, setEditing] = useState<PlatformRecord | null | undefined>(
            undefined,
        ),
        [message, setMessage] = useState("");
    const rawDef = data!.definitions[type],
        def = rawDef ? resourceDefinition(type, rawDef) : null,
        copy = RESOURCE_PRESENTATION[type];
    const refresh = useCallback(() => setRevision((v) => v + 1), []);
    useEffect(() => {
        if (!def?.actions.LEER) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            setError("");
            const params = new URLSearchParams({
                limit: "25",
                offset: String(offset),
                q: query,
            });
            if (scopeEquipoId) params.set("equipoId", scopeEquipoId);
            platformFetch<PageResult<PlatformRecord>>(
                `/records/${type}?${params}`,
                { signal: controller.signal },
            )
                .then((r) => {
                    if (!controller.signal.aborted) setResult(r);
                })
                .catch((e) => {
                    if (!controller.signal.aborted) setError(e.message);
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }, 200);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [type, def?.actions.LEER, query, offset, revision, scopeEquipoId]);
    if (!def)
        return (
            <p className={styles.card}>
                No tienes registros disponibles en esta sección.
            </p>
        );
    return (
        <section className={styles.page} aria-label={def.title}>
            {!hideTabs && options.length > 1 && (
                <nav
                    className={styles.tabs}
                    aria-label="Registros de la sección"
                >
                    {options.map(([id, d]) => (
                        <button
                            key={id}
                            aria-current={type === id ? "page" : undefined}
                            onClick={() => {
                                setType(id);
                                setOffset(0);
                                setQuery("");
                                setSelected(null);
                            }}
                        >
                            {resourceDefinition(id, d).title}
                        </button>
                    ))}
                </nav>
            )}
            <div className={styles.toolbar}>
                <div>
                    <h2>{def.title}</h2>
                    {!hideDescription && (
                        <p className={styles.muted}>
                            {copy?.description ||
                                "Registros disponibles dentro de tu alcance autorizado."}
                        </p>
                    )}
                </div>
                <div className={styles.actions}>
                    {extraActions}
                    <Button variant="outlined" onClick={refresh}>
                        Actualizar registros
                    </Button>
                    {def.actions.INSERTAR && (
                        <Button onClick={() => setEditing(null)}>
                            Registrar {def.singular.toLowerCase()}
                        </Button>
                    )}
                </div>
            </div>
            {message && (
                <p role="status" className={styles.success}>
                    {message}
                </p>
            )}
            <div className={styles.listPanel}>
                {def.actions.LEER && (
                    <label className={styles.search}>
                        Buscar registro
                        <input
                            className={styles.control}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setOffset(0);
                            }}
                        />
                    </label>
                )}
                {error ? (
                    <div role="alert" className={styles.error}>
                        {error}{" "}
                        <button className={styles.link} onClick={refresh}>
                            Reintentar registros
                        </button>
                    </div>
                ) : loading && def.actions.LEER ? (
                    <p role="status">Cargando registros…</p>
                ) : def.actions.LEER ? (
                    <>
                        <div className={styles.tableRegion}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        {copy ? (
                                            copy.columns.map((c) => (
                                                <th key={c.key}>{c.label}</th>
                                            ))
                                        ) : (
                                            <>
                                                <th>Estado</th>
                                                <th>Equipo</th>
                                                <th>Actualizado</th>
                                            </>
                                        )}
                                        {!copy && <th>Acción</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.items.map((row) => (
                                        <tr key={row.id}>
                                            <td>
                                                <button
                                                    className={styles.link}
                                                    onClick={() =>
                                                        setSelected(row)
                                                    }
                                                >
                                                    {row.nombre}
                                                </button>
                                            </td>
                                            {copy ? (
                                                copy.columns.map((c) => (
                                                    <td key={c.key}>
                                                        {resourceValue(
                                                            row,
                                                            c.key,
                                                            data!.teams,
                                                        )}
                                                    </td>
                                                ))
                                            ) : (
                                                <>
                                                    <td>
                                                        <span
                                                            className={
                                                                styles.chip
                                                            }
                                                        >
                                                            {row.estado.replaceAll(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {data!.teams.find(
                                                            (t) =>
                                                                t.id ===
                                                                row.equipoId,
                                                        )?.nombre ||
                                                            "Administración institucional"}
                                                    </td>
                                                    <td>
                                                        {displayDate(
                                                            row.actualizadoEn,
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            {!copy && (
                                                <td>
                                                    <button
                                                        className={styles.link}
                                                        onClick={() =>
                                                            setSelected(row)
                                                        }
                                                    >
                                                        Ver detalle
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!result.items.length && (
                                <div className={styles.card}>
                                    <p>
                                        No hay registros que coincidan con esta
                                        consulta.
                                    </p>
                                    {def.actions.INSERTAR && (
                                        <p className={styles.muted}>
                                            Usa Registrar{" "}
                                            {def.singular.toLowerCase()} para
                                            añadir el primero.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.toolbar}>
                            <p className={styles.muted}>
                                {result.total} registros · Página{" "}
                                {Math.floor(offset / 25) + 1}
                            </p>
                            <div className={styles.actions}>
                                <Button
                                    variant="outlined"
                                    state={
                                        offset && !loading
                                            ? "default"
                                            : "disabled"
                                    }
                                    onClick={() =>
                                        setOffset((v) => Math.max(0, v - 25))
                                    }
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outlined"
                                    state={
                                        offset + 25 < result.total && !loading
                                            ? "default"
                                            : "disabled"
                                    }
                                    onClick={() => setOffset((v) => v + 25)}
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className={styles.muted}>
                        Puedes registrar información en este módulo.
                    </p>
                )}
            </div>
            {editing !== undefined && (
                <RecordEditor
                    key={editing?.id || "new-" + type}
                    type={type}
                    record={editing || undefined}
                    initialTeamId={scopeEquipoId}
                    onClose={() => setEditing(undefined)}
                    onSaved={() => {
                        setEditing(undefined);
                        setSelected(null);
                        setMessage("El registro se guardó correctamente.");
                        refresh();
                    }}
                />
            )}
            {selected && editing === undefined && (
                <RecordDetail
                    key={selected.id}
                    type={type}
                    record={selected}
                    onClose={() => setSelected(null)}
                    onEdit={setEditing}
                    onChanged={refresh}
                />
            )}
        </section>
    );
}
