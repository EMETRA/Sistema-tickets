"use client";
import { statusLabel, statusTone } from "@/helpers/statusTone";
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
import { useProposalDesign } from "@/platform/proposal";
import { RecordDetail, displayDate } from "./RecordDetail";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
// Filtros rápidos por estado (el API acepta ?estado=).
const STATE_FILTERS: Record<string, [string, string][]> = {
    solicitudes: [
        ["PENDIENTE", "Pendientes"],
        ["APROBADA_PENDIENTE_CUENTA", "Aprobadas sin cuenta"],
        ["ATENDIDA", "Atendidas"],
        ["RECHAZADA", "Rechazadas"],
        ["", "Todas"],
    ],
};
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
    const proposal = useProposalDesign();
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
        [message, setMessage] = useState(""),
        // Propuesta: las solicitudes abren en «Pendientes», la pregunta diaria.
        [estado, setEstado] = useState(
            proposal && type === "solicitudes" ? "PENDIENTE" : "",
        );
    const stateFilters = proposal ? STATE_FILTERS[type] : undefined;
    const rawDef = data!.definitions[type],
        def = rawDef ? resourceDefinition(type, rawDef) : null,
        copy = RESOURCE_PRESENTATION[type];
    const refresh = useCallback(() => setRevision((v) => v + 1), []);
    // Propuesta: las listas no traen nombres de personas ni de referencias; se resuelven aquí.
    const [refNames, setRefNames] = useState<Record<string, string>>({});
    const refFields = proposal && copy && def
        ? copy.columns
              .map((c) => def.fields.find((f) => f.key === c.key))
              .filter((f): f is NonNullable<typeof f> => !!f && (f.type === "user" || (f.type === "ref" && !!f.resource)))
        : [];
    const refKey = refFields.map((f) => f.key + ":" + (f.resource || f.type)).join(",");
    useEffect(() => {
        if (!refKey) return;
        const controller = new AbortController();
        const sources = [...new Set(refFields.map((f) => (f.type === "user" ? "/people?q=" : `/records/${f.resource}?limit=100`)))];
        Promise.all(
            sources.map((path) =>
                platformFetch<PageResult<PlatformRecord> | { id: number | string; nombre: string }[]>(path, { signal: controller.signal })
                    .then((r) => (Array.isArray(r) ? r : r.items))
                    .catch(() => []),
            ),
        ).then((lists) => {
            if (controller.signal.aborted) return;
            setRefNames(Object.fromEntries(lists.flat().map((x) => [String(x.id), x.nombre])));
        });
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refKey]);
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
            if (estado && STATE_FILTERS[type]) params.set("estado", estado);
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
    }, [type, def?.actions.LEER, query, offset, revision, scopeEquipoId, estado]);
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
                    {!hideDescription && copy?.description && (
                        <p className={styles.muted}>{copy.description}</p>
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
            <div className={styles.listPanel} aria-busy={loading && !!def.actions.LEER}>
                {def.actions.LEER && (
                    <div className={styles.toolbar}>
                        <input className={styles.control + " " + styles.search} type="search"
                            aria-label="Buscar registro" placeholder="Buscar registro" value={query}
                            onChange={(e) => { setQuery(e.target.value); setOffset(0); }} />
                        {stateFilters && (
                            <div className={styles.stateFilters} role="group" aria-label="Filtrar por estado">
                                {stateFilters.map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={estado === value}
                                        data-tone={value ? statusTone(value) : undefined}
                                        onClick={() => { setEstado(value); setOffset(0); }}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {!loading && !error && <p className={styles.muted} role="status">
                            {result.total} {result.total === 1 ? "registro" : "registros"}
                        </p>}
                    </div>
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
                                                        {c.key === "estado" ? (
                                                            <span
                                                                className={styles.chip}
                                                                data-tone={statusTone(row.estado)}
                                                            >
                                                                {statusLabel(row.estado)}
                                                            </span>
                                                        ) : (
                                                            (refFields.some((f) => f.key === c.key) &&
                                                                refNames[String(row.datos[c.key])]) ||
                                                            (proposal &&
                                                                def.fields.find((f) => f.key === c.key)?.type === "select" &&
                                                                !!row.datos[c.key] &&
                                                                statusLabel(String(row.datos[c.key]))) ||
                                                            resourceValue(
                                                                row,
                                                                c.key,
                                                                data!.teams,
                                                            )
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
                                                            data-tone={statusTone(
                                                                row.estado,
                                                            )}
                                                        >
                                                            {statusLabel(
                                                                row.estado,
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
                                Página {Math.floor(offset / 25) + 1} de {Math.max(1, Math.ceil(result.total / 25))}
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
