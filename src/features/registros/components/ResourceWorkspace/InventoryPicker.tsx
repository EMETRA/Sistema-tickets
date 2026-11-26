"use client";
import { useState } from "react";
import { queryErrorMessage, usePlatformQuery } from "@/platform/query";
import { Button } from "@/components/client/atoms/Button";
import { PlatformError } from "@/platform/client";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export type InventoryItem = {
    referencia: string;
    numeroInventario: string;
    tarjeta: string;
    empleado: number;
    nombreEmpleado: string;
    descripcion: string;
    serie: string;
    modelo: string;
    entrada: number;
    fichaCompleta: boolean;
    fichaId?: string | null;
};
export function inventoryClass(description: string, network: boolean) {
    const s = description
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    if (/SWITCH/.test(s)) return "SWITCH";
    if (/ROUTER/.test(s)) return "ROUTER";
    if (/ACCESS.?POINT|PUNTO DE ACCESO/.test(s)) return "ACCESS_POINT";
    if (network) return /COMPUTADOR|CPU|LAPTOP|PORTATIL/.test(s) ? "EQUIPO" : undefined;
    if (/LAPTOP|PORTATIL/.test(s)) return "PORTATIL";
    if (/COMPUTADOR|CPU/.test(s)) return "COMPUTADORA";
    if (/IMPRESORA/.test(s)) return "IMPRESORA";
    if (/SERVIDOR/.test(s)) return "SERVIDOR";
    return undefined;
}
export function inventoryInitial(item: InventoryItem, type: string) {
    const clase = inventoryClass(item.descripcion, type === "dispositivos");
    return {
        inventarioReferencia: item.referencia,
        numeroInventario: item.numeroInventario,
        serie: item.serie,
        modelo: item.modelo,
        ...(clase ? { clase } : {}),
        ...(type === "activos" ? { detalle: item.descripcion } : {}),
    };
}
type Result = { items: InventoryItem[]; hayMas: boolean; message?: string };
export function InventoryCatalog({
    type = "activos",
    usuarioId,
    equipoId,
    empleado: fixedEmployee,
    onSelect,
    onOpen,
    title = "Bienes de Activos Fijos",
    embedded = false,
}: {
    type?: string;
    usuarioId?: string;
    equipoId?: string;
    empleado?: number;
    onSelect?: (item: InventoryItem) => void;
    onOpen?: (id: string) => void;
    title?: string;
    embedded?: boolean;
}) {
    const [empleado, setEmpleado] = useState(""),
        [tarjeta, setTarjeta] = useState(""),
        [numero, setNumero] = useState(""),
        [q, setQ] = useState(""),
        [filters, setFilters] = useState(""),
        [offset, setOffset] = useState(0);
    const inventoryParams = new URLSearchParams(filters);
    if (usuarioId) inventoryParams.set("usuarioId", usuarioId);
    if (equipoId) inventoryParams.set("equipoId", equipoId);
    if (fixedEmployee) inventoryParams.set("empleado", String(fixedEmployee));
    inventoryParams.set("offset", String(offset));
    const inventory = usePlatformQuery<Result>(`/inventory/${type}?${inventoryParams}`);
    const result = inventory.isFetching ? null : (inventory.data ?? null);
    const busy = inventory.isFetching;
    const denied = inventory.error instanceof PlatformError && inventory.error.status === 403;
    const error = inventory.error
        ? queryErrorMessage(inventory.error, "No se pudo consultar Activos Fijos.")
        : "";
    function search(e?: { preventDefault(): void }) {
        e?.preventDefault();
        setFilters(
            new URLSearchParams(
                Object.entries({ empleado, tarjeta, numero, q })
                    .filter(([, value]) => value.trim())
                    .map(([key, value]) => [key, value.trim()]),
            ).toString(),
        );
        setOffset(0);
        // Con los mismos filtros, «Consultar» vuelve a pedir los datos.
        void inventory.refetch();
    }
    const FilterContainer = embedded ? "div" : "form";
    return (
        <section className={styles.card} aria-label="Inventario institucional">
            <div className={styles.toolbar}>
                <div>
                    <h3>{title}</h3>
                    <p className={styles.muted}>
                        Origen: Activos Fijos. La ficha técnica se completa en Tickets.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outlined"
                    state={busy ? "disabled" : "default"}
                    onClick={() => void inventory.refetch()}
                >
                    Actualizar bienes
                </Button>
            </div>
            {!denied && (
                <FilterContainer
                    onSubmit={embedded ? undefined : search}
                    onKeyDown={(e) => {
                        if (embedded && e.key === "Enter") {
                            e.preventDefault();
                            search();
                        }
                    }}
                    className={styles.toolbar}
                >
                    {!usuarioId && !fixedEmployee && (
                        <label className={styles.field}>
                            Código de empleado (opcional)
                            <input
                                className={styles.control}
                                type="number"
                                min="1"
                                value={empleado}
                                onChange={(e) => setEmpleado(e.target.value)}
                            />
                        </label>
                    )}
                    <label className={styles.field}>
                        Tarjeta de responsabilidad
                        <input
                            className={styles.control}
                            maxLength={40}
                            value={tarjeta}
                            onChange={(e) => setTarjeta(e.target.value)}
                        />
                    </label>
                    <label className={styles.field}>
                        Número de inventario
                        <input
                            className={styles.control}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={16}
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                        />
                    </label>
                    <label className={styles.field}>
                        Descripción o serie
                        <input
                            className={styles.control}
                            maxLength={100}
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </label>
                    <Button
                        type={embedded ? "button" : "submit"}
                        onClick={embedded ? () => search() : undefined}
                        state={busy ? "disabled" : "default"}
                    >
                        Consultar bienes
                    </Button>
                </FilterContainer>
            )}
            {busy && <p role="status">Consultando Activos Fijos…</p>}
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {result?.message && <p role="status">{result.message}</p>}
            {result && !result.message && (
                <>
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Inventario / descripción</th>
                                    <th>Asignación institucional</th>
                                    <th>Serie / modelo</th>
                                    {(onSelect || onOpen) && <th>Ficha técnica</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {result.items.map((i, index) => (
                                    <tr key={`${i.referencia}:${i.tarjeta}:${i.empleado}:${index}`}>
                                        <td>
                                            <strong>{i.numeroInventario}</strong>
                                            <p>{i.descripcion || "Descripción pendiente en Activos Fijos"}</p>
                                            {!i.fichaCompleta && (
                                                <small>Ficha del bien incompleta en origen</small>
                                            )}
                                        </td>
                                        <td>
                                            Tarjeta {i.tarjeta}
                                            <p>
                                                {i.nombreEmpleado || "Empleado"} · {i.empleado}
                                            </p>
                                        </td>
                                        <td>
                                            {i.serie || "Sin serie"}
                                            <p>{i.modelo || "Sin modelo"}</p>
                                        </td>
                                        {(onSelect || onOpen) && (
                                            <td>
                                                {i.fichaId && onOpen ? (
                                                    <button
                                                        type="button"
                                                        className={styles.link}
                                                        onClick={() => onOpen(i.fichaId!)}
                                                    >
                                                        Ver ficha
                                                    </button>
                                                ) : onSelect && i.fichaCompleta ? (
                                                    <button
                                                        type="button"
                                                        className={styles.link}
                                                        aria-label={
                                                            "Crear ficha técnica " + i.numeroInventario
                                                        }
                                                        onClick={() => onSelect(i)}
                                                    >
                                                        + Crear ficha técnica
                                                    </button>
                                                ) : (
                                                    <span className={styles.muted}>Solo consulta</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!result.items.length && (
                        <p role="status">
                            No se encontraron bienes vigentes con estos filtros. Revisa el código de empleado
                            y la tarjeta en Activos Fijos.
                        </p>
                    )}
                    <div className={styles.toolbar}>
                        <p className={styles.muted}>
                            {result.items.length} asignaciones en esta página · Página{" "}
                            {Math.floor(offset / 50) + 1}
                        </p>
                        <div className={styles.actions}>
                            <Button
                                type="button"
                                variant="outlined"
                                state={busy || !offset ? "disabled" : "default"}
                                onClick={() => setOffset((v) => Math.max(0, v - 50))}
                            >
                                Bienes anteriores
                            </Button>
                            <Button
                                type="button"
                                variant="outlined"
                                state={busy || !result.hayMas ? "disabled" : "default"}
                                onClick={() => setOffset((v) => v + 50)}
                            >
                                Bienes siguientes
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
export function InventoryPicker({
    type,
    onSelect,
}: {
    type: string;
    onSelect: (item: InventoryItem) => void;
}) {
    return (
        <InventoryCatalog
            type={type}
            onSelect={onSelect}
            embedded
            title="Usar un bien de la tarjeta de responsabilidad"
        />
    );
}
