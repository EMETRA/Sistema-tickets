"use client";
import { useMemo, useState } from "react";
import { ProfileHeader } from "@/components/client/organisms/ProfileHeader";
import { MetricCard } from "@/components/client/molecules/MetricCard/MetricCard";
import { useGetUserById } from "@/api/hooks/useGetUserById";
import { useGetTicketsByUserId } from "@/api/hooks/useGetTicketsByUserId";
import { useAuthStore } from "@/store/useAuthStore";
import { HomeState } from "../Home/HomeHeading";
import styles from "./Profile.module.scss";

export default function Profile({ userId }: { userId?: string }) {
    const currentUserId = useAuthStore((state) => state.getUserId());
    const id = userId || currentUserId || "";
    const [view, setView] = useState("perfil");
    const { data: user, loading, error, refetch } = useGetUserById(Number(id));
    const tickets = useGetTicketsByUserId(id);
    const stats = useMemo(
        () => ({
            total: tickets.data.length,
            solved: tickets.data.filter((ticket) => Number(ticket.estadoId) === 5)
                .length,
            working: tickets.data.filter((ticket) => Number(ticket.estadoId) === 3)
                .length,
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
            <ProfileHeader
                bannerSrc="/images/city.png"
                avatarSrc={user.avatar}
                initials={user.nombre?.trim().charAt(0) || "U"}
                name={user.nombre}
                role={user.rol || "Usuario"}
                switchOptions={[
                    { label: "Perfil", value: "perfil" },
                    { label: "Mantenimiento", value: "mantenimiento" },
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
                                    <dd>{user.departamento || "No disponible"}</dd>
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
                                <HomeState loading message="Consultando solicitudes…" />
                            ) : tickets.error ? (
                                <HomeState
                                    message="No se pudo consultar el reporte de solicitudes."
                                    onRetry={() => void tickets.refetch()}
                                />
                            ) : (
                                <div className={styles.metrics}>
                                    <MetricCard label="Tickets creados" value={stats.total} />
                                    <MetricCard label="Resueltos" value={stats.solved} />
                                    <MetricCard label="En atención" value={stats.working} />
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    <section className={styles.identity}>
                        <h2>Mantenimiento y equipo</h2>
                        <p>
                            El registro de mantenimiento y asignación de equipo se gestiona
                            con Informática.
                        </p>
                        <p>
                            Consulta con el técnico responsable si necesitas registrar una
                            revisión o actualizar el equipo asignado.
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}
