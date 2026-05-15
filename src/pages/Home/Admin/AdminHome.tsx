"use client"

import React, { useEffect, useRef, useState } from "react";
import { DashboardStatsBar } from "@/components/client/organisms/DashboardStatsBar";
import { PerformanceChartPanel } from "@/components/client/organisms/PerformanceChartPanel";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import { TicketsResolvePanel } from "@/components/client/organisms/TicketsResolvePanel";
import type { DonutChartDataItem } from "@/components/client/atoms/DonutChart";
import TicketsPanel from "@/components/client/organisms/TicketsPanel/TicketsPanel";
import styles from "./AdminHome.module.scss";

import { TicketStatData } from "@/components/client/organisms/DashboardStatsBar";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";
import { ChipState } from "@/components/client/atoms/Chip/types";
import type { PerformancePoint } from "@/api/graphql/queries/getAdminHome";
import type { PrimaryFilter } from "@/components/client/organisms/PerformanceChartPanel/types";
import {
    useGetAdminDashboardStats,
    useGetUserPerformance,
    useGetLastMovements,
    useGetLastTicket,
} from "@/api/hooks";

const AdminHome: React.FC = () => {
    const [filter, setFilter] = useState<PrimaryFilter>("HOY");

    const { data: dashboardStats, loading: loadingStats, error: errorStats, refetch: refetchDashboardStats } = useGetAdminDashboardStats();
    const { data: performanceData, loading: loadingPerformance, error: errorPerformance, refetch: refetchUserPerformance } = useGetUserPerformance({ periodo: filter });
    const { data: lastMovements, loading: loadingMovements, error: errorMovements, refetch: refetchLastMovements } = useGetLastMovements();
    const { data: lastTickets, loading: loadingTickets, error: errorTickets, refetch: refetchLastTickets } = useGetLastTicket();

    const hasRunOnce = useRef(false);

    useEffect(() => {
        if (!hasRunOnce.current || !refetchUserPerformance || !refetchDashboardStats || !refetchLastMovements || !refetchLastTickets) {
            hasRunOnce.current = true;
            refetchDashboardStats();
            refetchUserPerformance();
            refetchLastMovements();
            refetchLastTickets();
        }
    }, [refetchDashboardStats, refetchLastMovements, refetchLastTickets, refetchUserPerformance]);

    // Derivar estados de carga y error
    const isLoading = loadingStats || loadingPerformance || loadingMovements || loadingTickets;
    const error = (errorStats || errorPerformance || errorMovements || errorTickets)
        ? "No fue posible cargar la información. Intenta nuevamente."
        : "";

    // Transformar datos del dashboard a TicketStatData[]
    const infoPanelStats: TicketStatData[] = dashboardStats
        ? [
            { type: "solved", label: "Tickets resueltos", value: dashboardStats.totales.resueltos },
            { type: "working", label: "Tickets en Trabajo", value: dashboardStats.totales.en_trabajo },
            { type: "entered", label: "Tickets Ingresados", value: dashboardStats.totales.ingresados },
            { type: "assigned", label: "Tickets Asignados", value: dashboardStats.totales.asignados },
        ]
        : [];

    // Transformar UserPerformance a datos para el gráfico
    const dataByFilter: PerformancePoint[] = performanceData
        ? performanceData.map(user => ({
            label: user.nombre || "Sin nombre",
            value: user.tickets_resueltos,
        }))
        : [];

    // Transformar LastMovements a EventItemProps[]
    const eventItems: EventItemProps[] = lastMovements
        ?.map(movement => ({
            type: "movement" as const,
            userName: movement.usuario || "Usuario",
            avatarInitials: movement.usuario ? movement.usuario.charAt(0) : "U",
            label: `${movement.ticket_codigo || "Sin código"}: ${movement.detalle}`,
            date: new Date(movement.fecha),
        })) || [];

    // Transformar LastTicket a TicketData[]
    console.log("Last tickets obtenidos:", lastTickets);
    const sampleTickets: TicketData[] = lastTickets
        ?.map((ticket) => {
            return {
                id: ticket.id_ticket,
                description: ticket.titulo,
                userName: ticket.creador,
                avatarInitials: ticket.creador ? ticket.creador.charAt(0) : "U",
                assigned: !!ticket.asignado,
                type: ticket.categoria || "Normal",
                status: ticket.estado.toLowerCase() === "en trabajo" ? "en_trabajo" as ChipState : ticket.estado.toLowerCase() as ChipState,
                statusLabel: ticket.estado,
                dateIngress: new Date(ticket.fecha_creacion),
            };
        }) || [];

    const ticketsResolvedData: DonutChartDataItem[] = dashboardStats?.por_estado
        ?.map(estado => ({
            label: estado.estado,
            value: estado.cantidad,
        })) || [];

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando información...</div>;
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>;
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.metricsContainer}>
                <DashboardStatsBar stats={infoPanelStats} />
            </div>
            <div className={styles.dashboardContainer}>
                <div className={styles.teamPerformanceContainer}>
                    <PerformanceChartPanel
                        variant="primary"
                        data={dataByFilter}
                        selectedFilter={filter}
                        onFilterChange={setFilter}
                    />
                    <InfoPanel type="team" items={eventItems} />
                </div>
                <div className={styles.ticketsPerformanceContainer}>
                    <TicketsResolvePanel data={ticketsResolvedData} />
                    <TicketsPanel variant="recent-tickets" tickets={sampleTickets} />
                </div>
            </div>
        </div>
    )
}

export default AdminHome;