"use client"

import React, { useEffect, useRef } from "react";
import { MyPerformanceChart } from "@/components/client/organisms/MyPerformanceChart";
import { MyStatisticsPanel } from "@/components/client/organisms/MyStatisticsPanel";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import TicketsPanel from "@/components/client/organisms/TicketsPanel/TicketsPanel";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";
import { ChipState } from "@/components/client/atoms/Chip/types";
import {
    useGetUser,
    useGetTechnicianStats,
    useGetTechnicianEvents,
    useGetTechnicianLastTickets,
} from "@/api/hooks";

import styles from "./TechHome.module.scss";

const TechHome: React.FC = () => {
    // Hooks para obtener datos del API
    const { data: userData, loading: loadingUser, error: errorUser, refetch: refetchUser } = useGetUser();
    const { data: technicianStatsData, loading: loadingStats, error: errorStats, refetch: refetchTechnicianStats } = useGetTechnicianStats();
    const { data: technicianEventsData, loading: loadingEvents, error: errorEvents, refetch: refetchTechnicianEvents } = useGetTechnicianEvents({ fecha_inicio: new Date().toISOString().split('T')[0] });
    const { data: technicianTicketsData, loading: loadingTickets, error: errorTickets, refetch: refetchTechnicianLastTickets } = useGetTechnicianLastTickets({ limit: 10 });

    const hasRunOnce = useRef(false);
    
    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetchUser();
            refetchTechnicianStats();
            refetchTechnicianEvents();
            refetchTechnicianLastTickets();
        }
    }, [refetchTechnicianEvents, refetchTechnicianLastTickets, refetchTechnicianStats, refetchUser]);

    // Derivar estados de carga y error
    const isLoading = loadingUser || loadingStats || loadingEvents || loadingTickets;
    const error = (errorUser || errorStats || errorEvents || errorTickets)
        ? "No fue posible cargar la información. Intenta nuevamente."
        : "";

    // Transformar datos del gráfico de rendimiento
    const performanceData = technicianStatsData?.grafico_rendimiento?.map(point => ({
        label: point.mes,
        value: point.resueltos,
    })) || [];

    // Transformar datos de estadísticas
    const statisticInfo = technicianStatsData
        ? {
            percentage: Math.round((technicianStatsData.resueltos / technicianStatsData.tickets) * 100),
            resolvedTickets: technicianStatsData.resueltos,
            assignedTickets: technicianStatsData.asignados,
            inProgressTickets: technicianStatsData.pendientes,
        }
        : {
            percentage: 0,
            resolvedTickets: 0,
            assignedTickets: 0,
            inProgressTickets: 0,
        };

    // Transformar eventos a EventItemProps
    const eventItems: EventItemProps[] = technicianEventsData
        ?.map(event => ({
            type: "event" as const,
            eventName: event.titulo,
            date: new Date(event.fecha_inicio),
        })) || [];

    // Transformar tickets del técnico a TicketData
    const sampleTickets: TicketData[] = technicianTicketsData
        ?.map((ticket, index) => {
            // DUMMY - ELIMINAR: para interpretar el estado retornaod del query
            const estadoMap: Record<number, { status: ChipState; label: string }> = {
                1: { status: "ingressed", label: "Ingresado" },
                2: { status: "assigned", label: "Asignado" },
                3: { status: "inwork", label: "En Trabajo" },
                4: { status: "resolved", label: "Resuelto" },
                5: { status: "canceled", label: "Cancelado" },
            };
            
            const estadoInfo = estadoMap[ticket.estado] || { status: "ingressed", label: "Ingresado" };

            // DUMMY - ELIMINAR: para interpretar el id retornaod del query
            const prioridadMap: Record<number, string> = {
                1: "Baja",
                2: "Normal",
                3: "Alta",
                4: "Urgente",
            };
            
            const tipo = prioridadMap[ticket.prioridad] || "Normal";

            return {
                id: index,
                description: ticket.titulo,
                userName: userData?.nombre || "Usuario",
                avatarInitials: userData?.nombre ? userData.nombre.charAt(0) : "U",
                assigned: true,
                type: tipo,
                status: estadoInfo.status,
                statusLabel: estadoInfo.label,
                dateIngress: new Date(ticket.fecha_creacion),
            };
        }) || [];

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando información...</div>;
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>;
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.dashboardContainer}>
                <div className={styles.myPerformanceContainer}>
                    <MyPerformanceChart
                        data={performanceData}
                        className={styles.performanceChart}
                        width={1000}
                    />
                    <MyStatisticsPanel
                        {...statisticInfo}
                    />
                </div>
                <div className={styles.eventsAndTicketsContainer}>
                    <InfoPanel type="team" items={eventItems} className={styles.infoPanel} />
                    <TicketsPanel variant="recent-tickets" tickets={sampleTickets} />
                </div>
            </div>
        </div>
    )
}

export default TechHome;