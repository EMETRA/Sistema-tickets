"use client"

import React, { useState } from "react";
import { DashboardStatsBar } from "@/components/client/organisms/DashboardStatsBar";
import { PerformanceChartPanel } from "@/components/client/organisms/PerformanceChartPanel";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import { TicketsResolvePanel } from "@/components/client/organisms/TicketsResolvePanel";
import TicketsPanel from "@/components/client/organisms/TicketsPanel/TicketsPanel";
import styles from "./AdminHome.module.scss";

import { TicketStatData } from "@/components/client/organisms/DashboardStatsBar";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";
import { ChipState } from "@/components/client/atoms/Chip/types";
import type { PerformanceFilter, PerformancePoint, TicketResolvedPoint } from "@/api/graphql/queries/getAdminHome";
import {
    useGetAdminDashboardStats,
    useGetUserPerformance,
    useGetLastMovements,
    useGetLastTicket,
} from "@/api/hooks";

const AdminHome: React.FC = () => {
    const [filter, setFilter] = useState<PerformanceFilter>("today");

    // Hooks para obtener datos del API
    const { data: dashboardStats, loading: loadingStats, error: errorStats } = useGetAdminDashboardStats();
    const { data: performanceData, loading: loadingPerformance, error: errorPerformance } = useGetUserPerformance();
    const { data: lastMovements, loading: loadingMovements, error: errorMovements } = useGetLastMovements();
    const { data: lastTickets, loading: loadingTickets, error: errorTickets } = useGetLastTicket();

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

    // Transformar UserPerformance a datos por filtro
    // Nota: En un escenario real, los hooks deberían filtrar según los parámetros
    // Por ahora, mantenemos los mismos datos para todos los filtros (simulando que vienen del backend)
    const dataByFilter: Record<PerformanceFilter, PerformancePoint[]> = performanceData?.rows
        ? {
            annual: performanceData.rows.map(user => ({
                label: user.nombre || "Sin nombre",
                value: user.tickets_resueltos * 1000, // Simulación de valor anual
            })),
            monthly: performanceData.rows.map(user => ({
                label: user.nombre || "Sin nombre",
                value: user.tickets_resueltos * 100, // Simulación de valor mensual
            })),
            weekly: performanceData.rows.slice(0, 3).map(user => ({
                label: user.nombre || "Sin nombre",
                value: user.tickets_resueltos * 20, // Simulación de valor semanal
            })),
            today: performanceData.rows.slice(0, 2).map(user => ({
                label: user.nombre || "Sin nombre",
                value: user.tickets_resueltos * 3, // Simulación de valor diario
            })),
        }
        : { annual: [], monthly: [], weekly: [], today: [] };

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
    const sampleTickets: TicketData[] = lastTickets
        ?.map((ticket, index) => {
            // Mapear estado a ChipState
            const estadoMap: Record<number, { status: ChipState; label: string }> = {
                1: { status: "ingressed", label: "Ingresado" },
                2: { status: "assigned", label: "Asignado" },
                3: { status: "inwork", label: "En Trabajo" },
                4: { status: "resolved", label: "Resuelto" },
                5: { status: "canceled", label: "Cancelado" },
            };

            const estadoInfo = estadoMap[ticket.estado] || { status: "ingressed", label: "Ingresado" };

            // Mapear prioridad a tipo
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
                userName: "Admin",
                avatarInitials: "A",
                assigned: !!ticket.asignado,
                type: tipo,
                status: estadoInfo.status,
                statusLabel: estadoInfo.label,
                dateIngress: new Date(ticket.fecha_creacion),
            };
        }) || [];

    // Transformar por_estado a TicketResolvedPoint[]
    // Combinamos los datos del dashboard con colores predefinidos
    const colorMap: Record<string, string> = {
        "Hardware": "#FF9100",
        "Software": "#00BC70",
        "Red": "#FFCE00",
        "Acceso": "#E63946",
        "Otros": "#6B7280",
    };

    const ticketsResolvedData: TicketResolvedPoint[] = dashboardStats?.por_estado
        ?.map(estado => ({
            label: estado.estado,
            value: estado.cantidad,
            color: colorMap[estado.estado] || "#6B7280",
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
                        data={dataByFilter[filter]}
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