"use client";
import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import { displayDate } from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import type { PageResult } from "@/platform/types";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
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
            "/audit?offset=" +
                offset +
                "&tipo=" +
                encodeURIComponent(type) +
                "&resultado=" +
                outcome,
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
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <Button
                    variant="outlined"
                    onClick={() => setRevision((n) => n + 1)}
                >
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
                <div className={styles.tableRegion}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha y actor</th>
                                <th>Acción y recurso</th>
                                <th>Resultado</th>
                                <th>Revisión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        {displayDate(r.fecha)}
                                        <br />
                                        {r.actor}
                                    </td>
                                    <td>
                                        {r.accion} · {r.tipo}
                                        <br />
                                        <small>{r.registroId}</small>
                                        <details>
                                            <summary>Antes y después</summary>
                                            <div className={styles.grid}>
                                                <pre className={styles.log}>
                                                    {JSON.stringify(
                                                        r.antes,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                                <pre className={styles.log}>
                                                    {JSON.stringify(
                                                        r.despues,
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </div>
                                            <small>
                                                Solicitud: {r.solicitudId}
                                            </small>
                                        </details>
                                    </td>
                                    <td>
                                        <span className={styles.chip}>
                                            {r.resultado}
                                        </span>
                                    </td>
                                    <td>
                                        {r.revisadoEn && r.confirmadoEn ? (
                                            <>
                                                <span>
                                                    Primera:{" "}
                                                    {displayDate(r.revisadoEn)}
                                                </span>
                                                <br />
                                                <span>
                                                    Segunda:{" "}
                                                    {displayDate(
                                                        r.confirmadoEn,
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            "No corresponde doble confirmación"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!result.items.length && (
                        <p className={styles.card}>
                            No hay movimientos con estos filtros.
                        </p>
                    )}
                </div>
            )}
            <div className={styles.toolbar}>
                <p className={styles.muted}>
                    {result.total} movimientos · Historial de solo lectura
                </p>
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
                        state={
                            offset + 50 < result.total ? "default" : "disabled"
                        }
                        onClick={() => setOffset(offset + 50)}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </section>
    );
}
