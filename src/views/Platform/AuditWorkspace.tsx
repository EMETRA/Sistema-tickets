"use client";
import { keepPreviousData } from "@tanstack/react-query";
import { queryErrorMessage, usePlatformQuery } from "@/platform/query";
import { statusLabel } from "@/helpers/statusTone";
import { useState } from "react";
import { Button } from "@/components/client/atoms/Button";
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
    const [offset, setOffset] = useState(0),
        [type, setType] = useState(""),
        [outcome, setOutcome] = useState("");
    const query = usePlatformQuery<PageResult<Audit>>(
        "/audit?offset=" + offset + "&tipo=" + encodeURIComponent(type) + "&resultado=" + outcome,
        { placeholderData: keepPreviousData },
    );
    const result = query.data ?? { items: [], total: 0, offset: 0, limit: 50 };
    const error = queryErrorMessage(query.error);
    const loading = query.isFetching;
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
                <Button variant="outlined" onClick={() => void query.refetch()}>
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
