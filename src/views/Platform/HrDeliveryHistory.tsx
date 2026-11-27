"use client";
import { useState } from "react";
import { usePlatformQuery } from "@/platform/query";
import { Button } from "@/components/client/atoms/Button";
import { hrDate, type HrCampaign, type HrDelivery } from "@/platform/hr";
import { HrSubmission, hrError } from "./HrProfileWorkspace";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Page = { items: HrDelivery[]; offset: number; hayMas: boolean };
export function HrDeliveryHistory({ campaign, userId }: { campaign: HrCampaign; userId: number }) {
    const [open, setOpen] = useState(false),
        [page, setPage] = useState(0);
    const history = usePlatformQuery<Page>(
        open ? "/hr/campaigns/" + campaign.id + "/users/" + userId + "/history?offset=" + page : null,
    );
    const data = history.data ?? null;
    const error = history.error ? hrError(history.error) : "";
    return (
        <section>
            <Button variant="outlined" onClick={() => setOpen((v) => !v)}>
                {open ? "Ocultar envíos anteriores" : "Ver envíos anteriores"}
            </Button>
            {open && (
                <div>
                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                            <Button variant="text" onClick={() => void history.refetch()}>
                                Reintentar historial
                            </Button>
                        </p>
                    )}
                    {!data && !error && <p role="status">Cargando envíos anteriores…</p>}
                    {data && !data.items.length && <p>No hay envíos anteriores.</p>}
                    {data?.items.map((d) => (
                        <details key={d.id}>
                            <summary>
                                Envío {d.revision} · {hrDate(d.enviadoEn)}
                            </summary>
                            <HrSubmission
                                data={{
                                    campana: campaign,
                                    entrega: d,
                                    estado: "ANTERIOR",
                                }}
                            />
                        </details>
                    ))}
                    {data && (
                        <div className={styles.actions}>
                            <Button
                                variant="outlined"
                                state={page === 0 ? "disabled" : "default"}
                                onClick={() => setPage((v) => Math.max(0, v - 10))}
                            >
                                Más recientes
                            </Button>
                            <Button
                                variant="outlined"
                                state={data.hayMas ? "default" : "disabled"}
                                onClick={() => setPage((v) => v + 10)}
                            >
                                Más antiguos
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
