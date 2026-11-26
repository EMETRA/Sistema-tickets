"use client";
import { statusLabel } from "@/helpers/statusTone";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import type { PageResult } from "@/platform/types";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import { AuditFeed } from "./AuditFeed";
type Audit = {
    id: string;
    actor: string;
    tipo: string;
    registroId: string;
    accion: string;
    resultado: string;
    fecha: string;
    antes: unknown;
    despues: unknown;
    solicitudId: string;
    revisadoEn: string | null;
    confirmadoEn: string | null;
};
export function AuditWorkspace() {
    const [result, setResult] = useState<PageResult<Audit>>({
            items: [],
            total: 0,
            offset: 0,
            limit: 50,
        }),
        [offset, setOffset] = useState(0),
        [type, setType] = useState(""),
        [outcome, setOutcome] = useState(""),
        [revision, setRevision] = useState(0),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false);
    useEffect(() => {
        const c = new AbortController();
        startTransition(() => {
            setLoading(true);
        });
        startTransition(() => {
            setError("");
        });
        platformFetch<PageResult<Audit>>(
            "/audit?offset=" + offset + "&tipo=" + encodeURIComponent(type) + "&resultado=" + outcome,
            { signal: c.signal },
        )
            .then(setResult)
            .catch((e) => {
                if (!c.signal.aborted) setError(e.message);
            })
            .finally(() => {
                if (!c.signal.aborted) setLoading(false);
            });
        return () => c.abort();
    }, [offset, type, outcome, revision]);
    return (
        <section className={styles.page}>
            <div className={styles.toolbar}>
                <div className={styles.actions}>
                    <label className={styles.field}>
                        Recurso
                        <input
                            className={styles.control}
                            placeholder="Ej. activos, users…"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                setOffset(0);
                            }}
                        />
                    </label>
                    <label className={styles.field}>
                        Resultado
                        <select
                            className={styles.control}
                            value={outcome}
                            onChange={(e) => {
                                setOutcome(e.target.value);
                                setOffset(0);
                            }}
                        >
                            <option value="">Todos</option>
                            {["CORRECTO", "DENEGADO", "FALLIDO"].map((x) => (
                                <option key={x} value={x}>
                                    {statusLabel(x)}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <Button variant="outlined" onClick={() => setRevision((n) => n + 1)}>
                    Actualizar
                </Button>
            </div>
            {error ? (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            ) : loading ? (
                <p role="status">Consultando trazabilidad…</p>
            ) : (
                <AuditFeed items={result.items} />
            )}
            <div className={styles.toolbar}>
                <p className={styles.muted}>{result.total} movimientos · Historial de solo lectura</p>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        state={offset ? "default" : "disabled"}
                        onClick={() => setOffset(Math.max(0, offset - 50))}
                    >
                        Anterior
                    </Button>
                    <Button
                        variant="outlined"
                        state={offset + 50 < result.total ? "default" : "disabled"}
                        onClick={() => setOffset(offset + 50)}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </section>
    );
}
