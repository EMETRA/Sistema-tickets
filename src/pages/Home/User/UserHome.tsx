"use client"

import React, { useEffect, useRef } from "react";
import { AppsGrid } from "@/components/client/organisms/AppsGrid";
import { WelcomeCard } from "@/components/client/organisms/WelcomeCard";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import { ReportTable } from "@/components/client/organisms/ReportTable";

import { EventItemProps } from "@/components/client/molecules/EventItem";
import { AppCardProps } from "@/components/client/molecules/AppCard/types";
import { IconName } from "@/components/client/atoms/Icon/types";
import { useGetUser, useGetMyStats, useGetAppsByRole, useGetMyActivity } from "@/api/hooks";

import styles from "./UserHome.module.scss";

const UserHome: React.FC = () => {
    const { data: userData, loading: loadingUser, error: errorUser, refetch: refetchUser } = useGetUser();
    const { data: statsData, loading: loadingStats, error: errorStats, refetch: refetchMyStats } = useGetMyStats();
    const { data: appsData, loading: loadingApps, error: errorApps, refetch: refetchAppsByRole } = useGetAppsByRole();
    const { data: myActivityData, loading: loadingMyActivity, error: errorMyActivity, refetch: refetchMyActivity } = useGetMyActivity();

    const hasRunOnce = useRef(false);
        
    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetchUser();
            refetchMyStats();
            refetchAppsByRole();
            refetchMyActivity();
        }
    }, [refetchAppsByRole, refetchMyActivity, refetchMyStats, refetchUser]);

    // Derivar valores de carga y error directamente
    const isLoading = loadingUser || loadingStats || loadingApps || loadingMyActivity;
    const error = (errorUser || errorStats || errorApps || errorMyActivity)
        ? "No fue posible cargar la información. Intenta nuevamente."
        : "";

    const user = userData
        ? {
            name: userData.nombre,
            role: userData.rol || "user",
        }
        : { name: "", role: "" };

    const reportData = statsData?.grafico_mensual?.map(point => ({
        label: point.mes,
        value: point.tickets,
    })) || [];

    const transformedApps: AppCardProps[] = appsData
        ?.map(app => ({
            icon: app.icono as IconName,
            iconLabel: app.nombre,
            title: app.nombre,
        })) || [];

    const eventItems: EventItemProps[] = myActivityData
        ? myActivityData.map(activity => ({
            type: "movement",
            userName: user.name || "Usuario",
            avatarInitials: user.name ? user.name.charAt(0) : "U",
            label: activity.descripcion,
            date: activity.fecha ? new Date(activity.fecha) : new Date(),
        }))
        : [];

    const handleBookmarkToggle = () => {
        // Implementar cuando el hook de apps retorne si la app está marcada o no
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
                        apps={transformedApps.map((app) => ({
                            ...app,
                            onBookmarkClick: () => handleBookmarkToggle(),
                            onButtonClick: () => handleAppClick(app.title),
                        }))}
                    />
                    <WelcomeCard
                        userName={user.name.split(" ")[0] || "Usuario"}
                        imageSrc="/images/image.png"
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