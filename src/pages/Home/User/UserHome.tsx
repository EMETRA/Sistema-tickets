"use client"

import React, { useEffect, useState } from "react";
import { AppsGrid } from "@/components/client/organisms/AppsGrid";
import { WelcomeCard } from "@/components/client/organisms/WelcomeCard";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import { ReportTable } from "@/components/client/organisms/ReportTable";

import { EventItemProps } from "@/components/client/molecules/EventItem";
import { AppCardProps } from "@/components/client/molecules/AppCard/types";
import {
    getMyActivityDummy,
    getMyAppsDummy,
    getReportTableDataDummy,
    getUserSummaryDummy,
} from "@/api/graphql/queries/getUserHome";

import styles from "./UserHome.module.scss";

const UserHome: React.FC = () => {
    const [user, setUser] = useState({
        name: "",
        role: "",
    });
    const [apps, setApps] = useState<AppCardProps[]>([]);
    const [eventItems, setEventItems] = useState<EventItemProps[]>([]);
    const [reportData, setReportData] = useState<Array<{ label: string; value: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError("");
                const [userSummary, appsData, myActivityData, reportTableData] = await Promise.all([
                    getUserSummaryDummy(),
                    getMyAppsDummy(),
                    getMyActivityDummy(),
                    getReportTableDataDummy(),
                ]);

                setUser(userSummary);
                setApps(appsData);
                setEventItems(myActivityData);
                setReportData(reportTableData);
            } catch (err) {
                console.error("Error cargando Home:", err);
                setError("No fue posible cargar la información. Intenta nuevamente.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleBookmarkToggle = (index: number) => {
        setApps(prev => prev.map((app, i) =>
            i === index ? { ...app, bookmarked: !app.bookmarked } : app
        ));
    };

    const handleAppClick = (title: string) => {
        alert(`Abriendo: ${title}`);
    };

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando información...</div>;
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>;
    }


    return (
        <div className={styles.mainContainer}>
            <div className={styles.dashboardContainer}>
                <div className={styles.appsContainer}>
                    <AppsGrid
                        title="Mis Apps"
                        apps={apps.map((app, index) => ({
                            ...app,
                            onBookmarkClick: () => handleBookmarkToggle(index),
                            onButtonClick: () => handleAppClick(app.title),
                        }))}
                    />
                    <WelcomeCard
                        userName={user.name.split(" ")[0]}
                        imageSrc= "/images/image.png"
                    />
                </div>
                <div className={styles.eventsAndPerformanceContainer}>
                    <InfoPanel type="my-activity" items={eventItems} className={styles.infoPanel} />
                    <ReportTable title="Reporte durante el año" iconName= "chart-simple-solid" data={reportData} className={styles.reportGraph} />
                </div>
            </div>
        </div>
    )
}

export default UserHome;