"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import type { CctPage, CctRow } from "@/platform/cct";
import { CctPager, CctTable, cctError } from "./CctParts";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
export function CctAgentAssignments({ agente }: { agente: CctRow }) {
    const [data, setData] = useState<CctPage | null>(null),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const request = useRef<AbortController | null>(null);
    async function load(offset = 0) {
        request.current?.abort();
        const c = new AbortController();
        request.current = c;
        setBusy(true);
        setError("");
        try {
            const result = await platformFetch<CctPage>(
                `/cct/agentes/${encodeURIComponent(agente.TIPO_AGENTE!)}/${encodeURIComponent(agente.CHAPA!)}/asignaciones?offset=${offset}`,
                { signal: c.signal },
            );
            if (
                !result ||
                !Array.isArray(result.items) ||
                !Number.isSafeInteger(result.total) ||
                typeof result.hayMas !== "boolean"
            )
                throw Error("La respuesta de asignaciones no es válida.");
            if (!c.signal.aborted) setData(result);
        } catch (e) {
            if (!c.signal.aborted) setError(cctError(e));
        } finally {
            if (!c.signal.aborted) setBusy(false);
        }
    }
    useEffect(() => {
        if (agente.TIPO_AGENTE) void load();
        return () => request.current?.abort();
    }, [agente.TIPO_AGENTE, agente.CHAPA]);
    return (
        <section aria-label="Asignaciones de remisiones">
            <h3>Asignaciones de remisiones</h3>
            {!agente.TIPO_AGENTE ? (
                <p>
                    Falta el tipo del agente en el catálogo para enlazar sus
                    talonarios con certeza.
                </p>
            ) : (
                <>
                    {busy && <p role="status">Consultando talonarios…</p>}
                    {error && (
                        <div role="alert" className={styles.error}>
                            {error}
                            <Button
                                variant="outlined"
                                onClick={() => void load(data?.offset || 0)}
                            >
                                Reintentar asignaciones
                            </Button>
                        </div>
                    )}
                    {data && (
                        <>
                            <CctTable
                                items={data.items}
                                columns={[
                                    "TALONARIO",
                                    "SERIE",
                                    "BOLETA_INICIAL",
                                    "BOLETA_FINAL",
                                    "BOLETA_ACTUAL",
                                    "BOLETAS_RESTANTES",
                                    "ESTATUS",
                                    "FECHA_INICIAL",
                                    "FECHA_FINAL",
                                ]}
                            />
                            <CctPager
                                data={data}
                                disabled={busy}
                                onPage={(offset) => void load(offset)}
                            />
                        </>
                    )}
                </>
            )}
        </section>
    );
}
