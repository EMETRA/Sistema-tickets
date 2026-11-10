"use client";
import { useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
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
};
export function inventoryClass(description: string, network: boolean) {
    const s = description
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    if (/SWITCH/.test(s)) return "SWITCH";
    if (/ROUTER/.test(s)) return "ROUTER";
    if (/ACCESS.?POINT|PUNTO DE ACCESO/.test(s)) return "ACCESS_POINT";
    if (network)
        return /COMPUTADOR|CPU|LAPTOP|PORTATIL/.test(s) ? "EQUIPO" : undefined;
    if (/LAPTOP|PORTATIL/.test(s)) return "PORTATIL";
    if (/COMPUTADOR|CPU/.test(s)) return "COMPUTADORA";
    if (/IMPRESORA/.test(s)) return "IMPRESORA";
    if (/SERVIDOR/.test(s)) return "SERVIDOR";
    return undefined;
}
export function InventoryPicker({
    type,
    onSelect,
}: {
    type: string;
    onSelect: (item: InventoryItem) => void;
}) {
    const [empleado, setEmpleado] = useState(""),
        [tarjeta, setTarjeta] = useState(""),
        [items, setItems] = useState<InventoryItem[] | null>(null),
        [offset, setOffset] = useState(0),
        [more, setMore] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    async function search(next = 0) {
        setBusy(true);
        setError("");
        try {
            const r = await platformFetch<{
                items: InventoryItem[];
                hayMas: boolean;
            }>(
                `/inventory/${type}?empleado=${encodeURIComponent(empleado)}&tarjeta=${encodeURIComponent(tarjeta)}&offset=${next}`,
            );
            setItems(r.items);
            setOffset(next);
            setMore(r.hayMas);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo consultar el inventario",
            );
            setItems(null);
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.card} aria-label="Inventario institucional">
            <h3>Usar un bien de la tarjeta de responsabilidad</h3>
            <p className={styles.muted}>
                Consulta el inventario institucional y completa únicamente los
                datos técnicos. La tarjeta y su asignación se conservan en el
                sistema de origen.
            </p>
            <div className={styles.toolbar}>
                <label className={styles.field}>
                    Código de empleado
                    <input
                        aria-label="Código de empleado"
                        className={styles.control}
                        type="number"
                        min="1"
                        value={empleado}
                        onChange={(e) => {
                            setEmpleado(e.target.value);
                            setItems(null);
                            setOffset(0);
                        }}
                    />
                </label>
                <label className={styles.field}>
                    Tarjeta (opcional)
                    <input
                        aria-label="Tarjeta de responsabilidad"
                        className={styles.control}
                        value={tarjeta}
                        maxLength={40}
                        onChange={(e) => {
                            setTarjeta(e.target.value);
                            setItems(null);
                            setOffset(0);
                        }}
                    />
                </label>
                <Button
                    type="button"
                    variant="outlined"
                    state={
                        busy ? "loading" : !empleado ? "disabled" : "default"
                    }
                    onClick={() => void search(0)}
                >
                    Consultar bienes
                </Button>
            </div>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {items && (
                <>
                    <p role="status">
                        {items.length} bienes vigentes encontrados.
                    </p>
                    <div style={{ maxHeight: 260, overflow: "auto" }}>
                        {items.map((i) => (
                            <div
                                key={
                                    i.referencia +
                                    ":" +
                                    i.tarjeta +
                                    ":" +
                                    i.empleado
                                }
                                className={styles.toolbar}
                            >
                                <span>
                                    <strong>{i.numeroInventario}</strong> ·{" "}
                                    {i.descripcion}
                                    <br />
                                    <small>
                                        Tarjeta {i.tarjeta} · {i.nombreEmpleado}{" "}
                                        · Serie {i.serie || "sin dato"}
                                    </small>
                                </span>
                                <Button
                                    variant="outlined"
                                    type="button"
                                    onClick={() => onSelect(i)}
                                >
                                    Usar bien {i.numeroInventario}
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className={styles.toolbar}>
                        <Button
                            variant="outlined"
                            type="button"
                            state={busy || !offset ? "disabled" : "default"}
                            onClick={() =>
                                void search(Math.max(0, offset - 50))
                            }
                        >
                            Bienes anteriores
                        </Button>
                        <span>Página {Math.floor(offset / 50) + 1}</span>
                        <Button
                            variant="outlined"
                            type="button"
                            state={busy || !more ? "disabled" : "default"}
                            onClick={() => void search(offset + 50)}
                        >
                            Bienes siguientes
                        </Button>
                    </div>
                </>
            )}
        </section>
    );
}
