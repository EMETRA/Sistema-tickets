"use client"

import React, { useEffect, useState } from "react";
import { DashboardStatsBar } from "@/components/client/organisms/DashboardStatsBar";
import { PerformanceChartPanel } from "@/components/client/organisms/PerformanceChartPanel";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import { TicketsResolvePanel } from "@/components/client/organisms/TicketsResolvePanel";
import TicketsPanel from "@/components/client/organisms/TicketsPanel/TicketsPanel";
import styles from "./AdminHome.module.scss";
// import { AdminHomeProps } from "./types";

import { TicketStatData } from "@/components/client/organisms/DashboardStatsBar";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";
import {
  getDashboardStatsDummy,
  getPerformanceByFilterDummy,
  getRecentTicketsDummy,
  getTeamMovementsDummy,
  getTicketsResolvedDummy,
  PerformanceFilter,
  PerformancePoint,
  TicketResolvedPoint,
} from "@/api/graphql/queries/getAdminHome";

const AdminHome: React.FC = () => {
  const [infoPanelStats, setInfoPanelStats] = useState<TicketStatData[]>([]);
  const [dataByFilter, setDataByFilter] = useState<Record<PerformanceFilter, PerformancePoint[]>>({
    annual: [],
    monthly: [],
    weekly: [],
    today: [],
  });
  const [eventItems, setEventItems] = useState<EventItemProps[]>([]);
  const [ticketsResolvedData, setTicketsResolvedData] = useState<TicketResolvedPoint[]>([]);
  const [sampleTickets, setSampleTickets] = useState<TicketData[]>([]);
  const [filter, setFilter] = useState<PerformanceFilter>("today");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [stats, performance, movements, resolved, tickets] = await Promise.all([
          getDashboardStatsDummy(),
          getPerformanceByFilterDummy(),
          getTeamMovementsDummy(),
          getTicketsResolvedDummy(),
          getRecentTicketsDummy(),
        ]);

        setInfoPanelStats(stats);
        setDataByFilter(performance);
        setEventItems(movements);
        setTicketsResolvedData(resolved);
        setSampleTickets(tickets);
      } catch (err) {
        console.error("Error cargando Home admin:", err);
        setError("No fue posible cargar la información. Intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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