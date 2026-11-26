"use client";
import { keepPreviousData } from "@tanstack/react-query";
import { queryErrorMessage, usePlatformQuery } from "@/platform/query";
import { useEffect, useState } from "react";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import {
    inventoryClass,
    type InventoryItem,
} from "@/features/registros/components/ResourceWorkspace/InventoryPicker";
import common from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import styles from "./AssetsPanel.module.scss";

type Result = { items: InventoryItem[]; hayMas: boolean; message?: string };
const ICONS: Record<string, string> = {
    COMPUTADORA: "desktop-solid",
    PORTATIL: "desktop-solid",
    IMPRESORA: "print-solid",
    SERVIDOR: "layer-group-solid",
    SWITCH: "network-wired-solid",
    ROUTER: "network-wired-solid",
    ACCESS_POINT: "network-wired-solid",
};
const FILTERS = [
    ["numero", "Número de inventario"],
    ["tarjeta", "Tarjeta de responsabilidad"],
    ["empleado", "Código de empleado"],
] as const;

/**
 * Propuesta: inventario de Activos Fijos con un buscador principal, filtros
 * bajo demanda y el estado de la ficha técnica como etiqueta.
 */
export function AssetInventory({
    type = "activos",
    usuarioId,
    equipoId,
    empleado: fixedEmployee,
    onSelect,
    onOpen,
}: {
    type?: string;
    usuarioId?: string;
    equipoId?: string;
    empleado?: number;
    onSelect?: (item: InventoryItem) => void;
    onOpen?: (id: string) => void;
}) {
    const [text, setText] = useState(""),
        [extra, setExtra] = useState<Record<string, string>>({}),
        [draft, setDraft] = useState<Record<string, string>>({}),
        [more, setMore] = useState(false),
        [offset, setOffset] = useState(0);
    const [q, setQ] = useState("");
    // El texto libre se aplica al dejar de escribir.
    useEffect(() => {
        const timer = setTimeout(() => {
            setQ(text.trim());
            setOffset(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [text]);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    for (const [key, value] of Object.entries(extra)) if (value) params.set(key, value);
    if (usuarioId) params.set("usuarioId", usuarioId);
    if (equipoId) params.set("equipoId", equipoId);
    if (fixedEmployee) params.set("empleado", String(fixedEmployee));
    params.set("offset", String(offset));
    const query = usePlatformQuery<Result>(`/inventory/${type}?${params}`, {
        placeholderData: keepPreviousData,
    });
    const result = query.data ?? null;
    const busy = query.isFetching;
    const error = query.error ? queryErrorMessage(query.error, "No se pudo consultar Activos Fijos.") : "";

    const items = result?.items || [];
    const withFicha = items.filter((i) => i.fichaId).length;
    const pending = items.filter((i) => !i.fichaId && i.fichaCompleta).length;
    const incomplete = items.filter((i) => !i.fichaCompleta).length;
    const active = Object.entries(extra).filter(([, v]) => v);

    return (
        <section className={styles.inventory} aria-label="Inventario institucional" aria-busy={busy}>
            <div className={styles.searchBar}>
                <label className={styles.search}>
                    <span className={common.srOnly}>Buscar bienes</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path
                            d="m20 20-3.5-3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <input
                        type="search"
                        placeholder="Buscar por descripción, serie o modelo…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </label>
                <button
                    type="button"
                    className={styles.moreFilters}
                    aria-expanded={more}
                    onClick={() => {
                        setDraft(extra);
                        setMore(!more);
                    }}
                >
                    Más filtros{active.length ? ` · ${active.length}` : ""}
                </button>
                <button type="button" className={styles.ghost} onClick={() => void query.refetch()}>
                    Actualizar
                </button>
            </div>
            {more && (
                <form
                    className={styles.filterPanel}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setExtra(draft);
                        setOffset(0);
                        setMore(false);
                    }}
                >
                    {FILTERS.filter(([key]) => !(key === "empleado" && fixedEmployee)).map(([key, label]) => (
                        <label key={key}>
                            <span>{label}</span>
                            <input
                                inputMode="numeric"
                                value={draft[key] || ""}
                                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value.trim() }))}
                            />
                        </label>
                    ))}
                    <div className={styles.filterActions}>
                        <button type="button" className={styles.ghost} onClick={() => setDraft({})}>
                            Limpiar
                        </button>
                        <button type="submit" className={styles.apply}>
                            Aplicar filtros
                        </button>
                    </div>
                </form>
            )}
            {active.length > 0 && (
                <div className={styles.activeFilters}>
                    {active.map(([key, value]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setExtra((e) => ({ ...e, [key]: "" }))}
                            aria-label={`Quitar filtro ${FILTERS.find(([k]) => k === key)?.[1]} ${value}`}
                        >
                            {FILTERS.find(([k]) => k === key)?.[1]}: <strong>{value}</strong>{" "}
                            <span aria-hidden="true">×</span>
                        </button>
                    ))}
                </div>
            )}
            {error && (
                <p role="alert" className={common.error}>
                    {error}
                </p>
            )}
            {result?.message && <p role="status">{result.message}</p>}
            {result && !result.message && (
                <>
                    <p className={styles.tally} role="status">
                        <span>
                            <strong>{items.length}</strong> bienes en esta página
                        </span>
                        <span data-tone="success">{withFicha} con ficha técnica</span>
                        <span data-tone="warning">{pending} sin ficha</span>
                        {incomplete > 0 && (
                            <span data-tone="neutral">{incomplete} incompletos en origen</span>
                        )}
                    </p>
                    <ul className={styles.assetList}>
                        {items.map((i, index) => {
                            const clase = inventoryClass(i.descripcion, false);
                            return (
                                <li key={`${i.referencia}:${i.tarjeta}:${i.empleado}:${index}`}>
                                    <span className={styles.assetIcon} aria-hidden="true">
                                        <WorkspaceIcon
                                            name={ICONS[clase || ""] || "desktop-solid"}
                                            size={18}
                                        />
                                    </span>
                                    <div className={styles.assetMain}>
                                        <strong>
                                            {i.descripcion || "Descripción pendiente en Activos Fijos"}
                                        </strong>
                                        <small>
                                            <b>{i.numeroInventario}</b> · Serie {i.serie || "—"} ·{" "}
                                            {i.modelo || "Sin modelo"}
                                        </small>
                                    </div>
                                    <div className={styles.assetOwner}>
                                        <span>{i.nombreEmpleado || "Empleado"}</span>
                                        <small>
                                            Tarjeta {i.tarjeta} · Empleado {i.empleado}
                                        </small>
                                    </div>
                                    <div className={styles.assetAction}>
                                        {i.fichaId ? (
                                            <>
                                                <span className={common.chip} data-tone="success">
                                                    Con ficha
                                                </span>
                                                {onOpen && (
                                                    <button
                                                        type="button"
                                                        className={common.link}
                                                        onClick={() => onOpen(i.fichaId!)}
                                                    >
                                                        Ver ficha
                                                    </button>
                                                )}
                                            </>
                                        ) : i.fichaCompleta ? (
                                            <>
                                                <span className={common.chip} data-tone="warning">
                                                    Sin ficha
                                                </span>
                                                {onSelect && (
                                                    <button
                                                        type="button"
                                                        className={common.link}
                                                        aria-label={
                                                            "Crear ficha técnica " + i.numeroInventario
                                                        }
                                                        onClick={() => onSelect(i)}
                                                    >
                                                        + Crear ficha
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <span
                                                className={common.chip}
                                                data-tone="neutral"
                                                title="Completa los datos del bien en Activos Fijos"
                                            >
                                                Incompleto en origen
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    {!items.length && (
                        <p className={styles.emptyList}>
                            Ningún bien coincide. Revisa la descripción, la serie o los filtros aplicados.
                        </p>
                    )}
                    {(offset > 0 || result.hayMas) && (
                        <div className={styles.pager}>
                            <button
                                type="button"
                                className={styles.ghost}
                                disabled={busy || !offset}
                                onClick={() => setOffset((v) => Math.max(0, v - 50))}
                            >
                                ← Anteriores
                            </button>
                            <span>Página {Math.floor(offset / 50) + 1}</span>
                            <button
                                type="button"
                                className={styles.ghost}
                                disabled={busy || !result.hayMas}
                                onClick={() => setOffset((v) => v + 50)}
                            >
                                Siguientes →
                            </button>
                        </div>
                    )}
                </>
            )}
            {busy && !result && <p className={styles.emptyList}>Consultando Activos Fijos…</p>}
        </section>
    );
}
export default AssetInventory;
