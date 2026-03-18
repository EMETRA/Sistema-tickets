"use client"

import React, { useEffect, useState } from "react";
import { MyPerformanceChart } from "@/components/client/organisms/MyPerformanceChart";
import { MyStatisticsPanel } from "@/components/client/organisms/MyStatisticsPanel";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import TicketsPanel from "@/components/client/organisms/TicketsPanel/TicketsPanel";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { TicketData } from "@/components/client/organisms/TicketsPanel";
import {
    getPerformanceDataDummy,
    getRecentTicketsDummy,
    getTeamEventsDummy,
    getTechStatisticsDummy,
    TechStatistics,
} from "@/api/graphql/queries/getTechHome";

import styles from "./TechHome.module.scss";

const TechHome: React.FC = () => {
    const [performanceData, setPerformanceData] = useState<Array<{ label: string; value: number }>>([]);
    const [statisticInfo, setStatisticInfo] = useState<TechStatistics>({
        percentage: 0,
        resolvedTickets: 0,
        assignedTickets: 0,
        inProgressTickets: 0,
    });
    const [eventItems, setEventItems] = useState<EventItemProps[]>([]);
    const [sampleTickets, setSampleTickets] = useState<TicketData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError("");

                const [performance, statistics, events, tickets] = await Promise.all([
                    getPerformanceDataDummy(),
                    getTechStatisticsDummy(),
                    getTeamEventsDummy(),
                    getRecentTicketsDummy(),
                ]);

                setPerformanceData(performance);
                setStatisticInfo(statistics);
                setEventItems(events);
                setSampleTickets(tickets);
            } catch (err) {
                console.error("Error cargando Home técnico:", err);
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