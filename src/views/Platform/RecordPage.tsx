"use client";
import { useState } from "react";
import { queryErrorMessage, usePlatformQuery } from "@/platform/query";
import { useRouter } from "next/navigation";
import { usePlatform } from "@/platform/context";
import type { PlatformRecord } from "@/platform/types";
import { RecordDetail } from "@/features/registros/components/ResourceWorkspace/RecordDetail";
import { RecordEditor } from "@/features/registros/components/ResourceWorkspace/RecordEditor";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export function RecordPage({ type, id }: { type: string; id: string }) {
    const { data, loading, error } = usePlatform(),
        router = useRouter(),
        [editing, setEditing] = useState(false);
    const query = usePlatformQuery<PlatformRecord>(
        data?.definitions[type]?.actions?.LEER
            ? "/records/" + encodeURIComponent(type) + "/" + encodeURIComponent(id)
            : null,
    );
    const record = query.data ?? null;
    const failure = query.error ? queryErrorMessage(query.error) : "";
    if (loading && !data) return <p role="status">Cargando ficha…</p>;
    if (error || failure || !data?.definitions[type]?.actions?.LEER)
        return (
            <p className={styles.error} role="alert">
                {error || failure || "No tienes permiso para consultar este registro."}
            </p>
        );
    const group =
            type === "modulos"
                ? "accesos"
                : type === "solicitudes"
                  ? "solicitudes"
                  : data.definitions[type].group,
        close = () => router.push("/espacio/" + group);
    return (
        <section>
            <h2>Ficha del registro</h2>
            {record &&
                (!editing ? (
                    <RecordDetail
                        type={type}
                        record={record}
                        onClose={close}
                        onEdit={() => setEditing(true)}
                        onChanged={() => void query.refetch()}
                    />
                ) : (
                    <RecordEditor
                        type={type}
                        record={record}
                        onClose={() => setEditing(false)}
                        onSaved={() => setEditing(false)}
                    />
                ))}
        </section>
    );
}
