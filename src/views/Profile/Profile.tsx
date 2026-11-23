"use client";
import { HrProfileWorkspace } from "@/views/Platform/HrProfileWorkspace";
import { useMemo, useState } from "react";
import Link from "next/link";
import {usePlatform} from "@/platform/context";
import {platformSections} from "@/platform/navigation";
import { ProfileHeader } from "@/components/client/organisms/ProfileHeader";
import { MetricCard } from "@/components/client/molecules/MetricCard/MetricCard";
import { useGetUserById } from "@/api/hooks/useGetUserById";
import { useGetTicketsByUserId } from "@/api/hooks/useGetTicketsByUserId";
import { useAuthStore } from "@/store/useAuthStore";
import { HomeState } from "../Home/HomeHeading";
import { InventoryCatalog } from "@/components/client/organisms/ResourceWorkspace/InventoryPicker";
import styles from "./Profile.module.scss";

function ColleagueProfile({ userId }: { userId?: string }) {
    const {data: platform}=usePlatform();
    const currentUserId = useAuthStore((state) => state.getUserId());
    const id = userId || currentUserId || "";
    const [view, setView] = useState("perfil");
    const { data: user, loading, error, refetch } = useGetUserById(Number(id));
    const tickets = useGetTicketsByUserId(id);
    const stats = useMemo(
        () => ({
            total: tickets.data.length,
            solved: tickets.data.filter(
                (ticket) => Number(ticket.estadoId) === 5,
            ).length,
            working: tickets.data.filter(
                (ticket) => Number(ticket.estadoId) === 3,
            ).length,
        }),
        [tickets.data],
    );
    if (loading) return <HomeState loading message="Cargando el perfil…" />;
    if (error || !user)
        return (
            <HomeState
                message="No se pudo cargar el perfil."
                onRetry={() => void refetch()}
            />
        );
    return (
        <div className={styles.container}>
            <Link href={platform && platformSections(platform).some(s=>s.id==="organizacion") ? "/espacio/organizacion?view=personas" : "/equipo"}>Volver al personal</Link>
            <ProfileHeader
                bannerSrc="/images/city.png"
                avatarSrc={user.avatar}
                initials={user.nombre?.trim().charAt(0) || "U"}
                name={user.nombre}
                role={user.rol || "Usuario"}
                switchOptions={[
                    { label: "Perfil", value: "perfil" },
                    { label: "Bienes asignados", value: "mantenimiento" },
                ]}
                switchValue={view}
                onSwitchChange={setView}
            />
            <div className={styles.viewLayout}>
                {view === "perfil" ? (
                    <>
                        <section className={styles.identity}>
                            <h2>Información del colaborador</h2>
                            <dl>
                                <div>
                                    <dt>Correo</dt>
                                    <dd>{user.email || "No disponible"}</dd>
                                </div>
                                <div>
                                    <dt>Departamento</dt>
                                    <dd>
                                        {user.departamento || "No disponible"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Perfil</dt>
                                    <dd>{user.rol || "No disponible"}</dd>
                                </div>
                            </dl>
                        </section>
                        <section className={styles.identity}>
                            <h2>Solicitudes registradas</h2>
                            <p>Tickets creados por este colaborador.</p>
                            {tickets.loading ? (
                                <HomeState
                                    loading
                                    message="Consultando solicitudes…"
                                />
                            ) : tickets.error ? (
                                <HomeState
                                    message="No se pudo consultar el reporte de solicitudes."
                                    onRetry={() => void tickets.refetch()}
                                />
                            ) : (
                                <div className={styles.metrics}>
                                    <MetricCard
                                        label="Tickets creados"
                                        value={stats.total}
                                    />
                                    <MetricCard
                                        label="Resueltos"
                                        value={stats.solved}
                                    />
                                    <MetricCard
                                        label="En atención"
                                        value={stats.working}
                                    />
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <div className={styles.inventory}>
                        <InventoryCatalog
                            key={id}
                            usuarioId={String(id)}
                            title="Equipo asignado al colaborador"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Profile({userId}:{userId?:string}){const own=useAuthStore(s=>s.getUserId());return !userId||(own&&String(own)===String(userId))?<HrProfileWorkspace/>:<ColleagueProfile userId={userId}/>;}
