"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { AppsGrid } from "@/components/client/organisms/AppsGrid";
import { WelcomeCard } from "@/components/client/organisms/WelcomeCard";
import { InfoPanel } from "@/components/client/organisms/InfoPanel";
import { ReportTable } from "@/components/client/organisms/ReportTable";

import { EventItemProps } from "@/components/client/molecules/EventItem";
import { IconName } from "@/components/client/atoms/Icon/types";
import { useGetUser, useGetMyStats, useGetMyActivity } from "@/api/hooks";
import { getMainApps } from "@/config/apps-catalog";
import { canAccessMainApp } from "@/config/apps-access";
import { useAppsCatalogContext } from "@/context/AppsCatalogContext";
import { useAuthStore } from "@/store/useAuthStore";

import styles from "./UserHome.module.scss";
import { useRouter } from "next/navigation";

const UserHome: React.FC = () => {
    const router = useRouter();
    const departamento = useAuthStore((state) => state.user?.departamento ?? null);
    const { catalog, loading: catalogLoading, error: catalogError } =
        useAppsCatalogContext();
    const { data: userData, loading: loadingUser, refetch: refetchUser } = useGetUser();
    const { data: statsData, loading: loadingStats, refetch: refetchMyStats } = useGetMyStats();
    const {
        data: myActivityData,
        loading: loadingMyActivity,
        refetch: refetchMyActivity,
    } = useGetMyActivity({ limit: 10 });

    const hasRunOnce = useRef(false);

    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetchUser();
            refetchMyStats();
            refetchMyActivity();
        }
    }, [refetchMyActivity, refetchMyStats, refetchUser]);

    const isLoading =
        loadingUser || loadingStats || loadingMyActivity || catalogLoading;

    const user = userData
        ? {
            name: userData.nombre,
            role: userData.rol || "USUARIO",
            departamento: userData.departamento || departamento,
        }
        : { name: "", role: "", departamento: departamento };

    const reportData =
        statsData?.grafico_mensual?.map((point) => ({
            label: point.mes,
            value: point.tickets,
        })) || [];

    const mainApps = useMemo(() => {
        if (!catalog) return [];
        const dept = user.departamento || departamento;
        return getMainApps(catalog).filter((app) => canAccessMainApp(dept, app.id));
    }, [catalog, user.departamento, departamento]);

    const eventItems: EventItemProps[] = myActivityData
        ? myActivityData.map((activity) => ({
            type: "movement",
            userName: user.name || "Usuario",
            avatarInitials: user.name ? user.name.charAt(0) : "U",
            label: activity.descripcion,
            date: activity.fecha ? new Date(activity.fecha) : new Date(),
        }))
        : [];

    const handleAppClick = (appId: string) => {
        router.push(`/home/${appId}`);
    };

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando información...</div>;
    }

    if (catalogError) {
        return (
            <div className={styles.mainContainer}>
                No fue posible cargar las aplicaciones. Intenta nuevamente.
            </div>
        );
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.dashboardContainer}>
                <div className={styles.appsContainer}>
                    <AppsGrid
                        title="Mis Apps"
                        apps={mainApps.map((app) => ({
                            icon: app.iconName as IconName,
                            iconLabel: app.label,
                            title: app.title,
                            onButtonClick: () => handleAppClick(app.id),
                        }))}
                    />
                    <WelcomeCard
                        userName={user.name.split(" ")[0] || "Usuario"}
                        imageSrc="/images/image.png"
                    />
                </div>
                <div className={styles.eventsAndPerformanceContainer}>
                    <InfoPanel
                        type="my-activity"
                        items={eventItems}
                        className={styles.infoPanel}
                    />
                    <ReportTable
                        title="Reporte durante el año"
                        iconName="chart-simple-solid"
                        data={reportData}
                        className={styles.reportGraph}
                    />
                </div>
            </div>
        </div>
    );
};

export default UserHome;
