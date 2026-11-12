"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { InventoryWorkspace } from "./InventoryWorkspace";
import { RecordEditor } from "./RecordEditor";
import { RecordDetail, displayDate } from "./RecordDetail";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
export function ResourceWorkspace({
    group,
    initialType,
    types,
}: {
    group: string;
    initialType?: string;
    types?: string[];
}) {
    const { data } = usePlatform(),
        options = Object.entries(data!.definitions).filter(
            ([id, def]) =>
                def.group === group && (!types || types.includes(id)),
        ),
        [type, setType] = useState(initialType || (group === "inventario" && options.some(([id]) => id === "activos") ? "activos" : options[0]?.[0]) || ""),
        [query, setQuery] = useState(""),
        [offset, setOffset] = useState(0),
        [result, setResult] = useState<PageResult<PlatformRecord>>({
            items: [],
            total: 0,
            offset: 0,
            limit: 25,
        }),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0),
        [selected, setSelected] = useState<PlatformRecord | null>(null),
        [editing, setEditing] = useState<PlatformRecord | null | undefined>(
            undefined,
        ),
        [message, setMessage] = useState("");
    const def = data!.definitions[type];
    const [source, setSource] = useState(true);
    const hasInventory = ["activos", "dispositivos"].includes(type);
    const refresh = useCallback(() => setRevision((r) => r + 1), []);
    useEffect(() => {
        if (!def?.actions.LEER || (hasInventory && source)) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setLoading(true);
            setError("");
            platformFetch<PageResult<PlatformRecord>>(
                "/records/" +
                    type +
                    "?limit=25&offset=" +
                    offset +
                    "&q=" +
                    encodeURIComponent(query),
                { signal: controller.signal },
            )
                .then(setResult)
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
    }, [
        type,
        def?.actions.LEER,
        query,
        offset,
        revision,
        hasInventory,
        source,
    ]);
    if (!def)
        return (
            <p className={styles.muted}>
                No tienes módulos disponibles en esta sección.
            </p>
        );
    return (
        <section className={styles.page}>
            <nav className={styles.tabs} aria-label="Módulos de la sección">
                {options.map(([id, d]) => (
                    <button
                        key={id}
                        aria-current={type === id ? "page" : undefined}
                        onClick={() => {
                            setType(id);
                            setOffset(0);
                            setQuery("");
                            setResult({
                                items: [],
                                total: 0,
                                offset: 0,
                                limit: 25,
                            });
                        }}
                    >
                        {d.title}
                    </button>
                ))}
            </nav>
            {hasInventory && (
                <nav className={styles.tabs} aria-label="Origen de los bienes">
                    <button
                        aria-current={source ? "page" : undefined}
                        onClick={() => setSource(true)}
                    >
                        Activos Fijos
                    </button>
                    <button
                        aria-current={!source ? "page" : undefined}
                        onClick={() => setSource(false)}
                    >
                        Fichas técnicas en Tickets
                    </button>
                </nav>
            )}
            {hasInventory && source ? (
                <InventoryWorkspace key={type} type={type} />
            ) : (
                <>
                    <div className={styles.toolbar}>
                        <div>
                            <h2>{def.title}</h2>
                            <p className={styles.muted}>
                                Consulta los registros y su historial dentro de
                                tu alcance autorizado.
                            </p>
                        </div>
                        <div className={styles.actions}>
                            <Button variant="outlined" onClick={refresh}>
                                Actualizar
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
                                <span className={styles.muted}>
                                    Buscar por nombre
                                </span>
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
                                <button
                                    className={styles.link}
                                    onClick={refresh}
                                >
                                    Reintentar
                                </button>
                            </div>
                        ) : loading ? (
                            <p role="status" className={styles.muted}>
                                Cargando registros…
                            </p>
                        ) : def.actions.LEER ? (
                            <>
                                <div className={styles.tableRegion}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Estado</th>
                                                <th>Equipo</th>
                                                <th>Actualizado</th>
                                                <th>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.items.map((row) => (
                                                <tr key={row.id}>
                                                    <td>
                                                        <button
                                                            className={
                                                                styles.link
                                                            }
                                                            onClick={() =>
                                                                setSelected(row)
                                                            }
                                                        >
                                                            {row.nombre}
                                                        </button>
                                                    </td>
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
                                                    <td>
                                                        <button
                                                            className={
                                                                styles.link
                                                            }
                                                            onClick={() =>
                                                                setSelected(row)
                                                            }
                                                        >
                                                            Ver ficha
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {!result.items.length && (
                                        <p className={styles.card}>
                                            No hay registros para esta consulta.
                                        </p>
                                    )}
                                </div>
                                <div className={styles.toolbar}>
                                    <p className={styles.muted}>
                                        {result.total} registros
                                    </p>
                                    <div className={styles.actions}>
                                        <Button
                                            variant="outlined"
                                            state={
                                                offset ? "default" : "disabled"
                                            }
                                            onClick={() =>
                                                setOffset(
                                                    Math.max(0, offset - 25),
                                                )
                                            }
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            state={
                                                offset + 25 < result.total
                                                    ? "default"
                                                    : "disabled"
                                            }
                                            onClick={() =>
                                                setOffset(offset + 25)
                                            }
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
                </>
            )}
            {editing !== undefined && (
                <RecordEditor
                    key={editing?.id || "new-" + type}
                    type={type}
                    record={editing || undefined}
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
