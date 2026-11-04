"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import { RecordDetail } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import { RecordEditor } from "@/components/client/organisms/ResourceWorkspace/RecordEditor";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export function RecordPage({ type, id }: { type: string; id: string }) {
    const { data, loading, error } = usePlatform(),
        router = useRouter(),
        [record, setRecord] = useState<PlatformRecord | null>(null),
        [failure, setFailure] = useState(""),
        [editing, setEditing] = useState(false),
        [revision, setRevision] = useState(0);
    useEffect(() => {
        if (!data?.definitions[type]?.actions?.LEER) return;
        const c = new AbortController();
        platformFetch<PlatformRecord>(
            "/records/" +
                encodeURIComponent(type) +
                "/" +
                encodeURIComponent(id),
            { signal: c.signal },
        )
            .then(setRecord)
            .catch((e) => {
                if (!c.signal.aborted) setFailure(e.message);
            });
        return () => c.abort();
    }, [data, type, id, revision]);
    if (loading && !data) return <p role="status">Cargando ficha…</p>;
    if (error || failure || !data?.definitions[type]?.actions?.LEER)
        return (
            <p className={styles.error} role="alert">
                {error ||
                    failure ||
                    "No tienes permiso para consultar este registro."}
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
                        onEdit={(r) => {
                            setRecord(r);
                            setEditing(true);
                        }}
                        onChanged={() => setRevision((n) => n + 1)}
                    />
                ) : (
                    <RecordEditor
                        type={type}
                        record={record}
                        onClose={() => setEditing(false)}
                        onSaved={(r) => {
                            setRecord(r);
                            setEditing(false);
                            setRevision((n) => n + 1);
                        }}
                    />
                ))}
        </section>
    );
}
