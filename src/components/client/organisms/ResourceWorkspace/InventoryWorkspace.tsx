"use client";
import { useState } from "react";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import {
    InventoryCatalog,
    inventoryInitial,
    type InventoryItem,
} from "./InventoryPicker";
import { RecordEditor } from "./RecordEditor";
import { RecordDetail } from "./RecordDetail";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
export function InventoryWorkspace({
    type = "activos",
    equipoId,
    empleado,
}: {
    type?: string;
    equipoId?: string;
    empleado?: number;
}) {
    const { data } = usePlatform();
    const [item, setItem] = useState<InventoryItem | null>(null),
        [record, setRecord] = useState<PlatformRecord | null>(null),
        [editing, setEditing] = useState(false),
        [revision, setRevision] = useState(0),
        [error, setError] = useState("");
    const def = data?.definitions[type];
    if (!def?.actions.LEER)
        return (
            <p className={styles.muted}>
                No tienes permiso para consultar el inventario institucional.
            </p>
        );
    async function open(id: string) {
        setError("");
        try {
            setRecord(
                await platformFetch<PlatformRecord>(`/records/${type}/${id}`),
            );
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo abrir la ficha técnica.",
            );
        }
    }
    return (
        <>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            <InventoryCatalog
                key={revision}
                type={type}
                equipoId={equipoId}
                empleado={empleado}
                onSelect={
                    def.actions.INSERTAR
                        ? (i) => {
                              setItem(i);
                              setRecord(null);
                              setEditing(true);
                          }
                        : undefined
                }
                onOpen={(id) => void open(id)}
            />
            {editing && (
                <RecordEditor
                    type={type}
                    record={record || undefined}
                    initial={item ? inventoryInitial(item, type) : undefined}
                    initialName={
                        item
                            ? item.descripcion.slice(0, 200) ||
                              `Bien ${item.numeroInventario}`
                            : undefined
                    }
                    onClose={() => {
                        setEditing(false);
                        setItem(null);
                    }}
                    onSaved={() => {
                        setEditing(false);
                        setItem(null);
                        setRecord(null);
                        setRevision((v) => v + 1);
                    }}
                />
            )}
            {record && !editing && (
                <RecordDetail
                    type={type}
                    record={record}
                    onClose={() => setRecord(null)}
                    onEdit={(r) => {
                        setItem(null);
                        setRecord(r);
                        setEditing(true);
                    }}
                    onChanged={() => setRevision((v) => v + 1)}
                />
            )}
        </>
    );
}
