"use client";

import React, { useState } from "react";
import { ProfileHeader } from "@/components/client/organisms/ProfileHeader";
import { UserPerformance } from "@/components/client/organisms/UserPerformance";
import { UserInfoPanel } from "@/components/client/organisms/UserInfoPanel";
import { MaintenanceRecordPanel } from "@/components/client/organisms/MaintenanceRecordPanel";
import { EquipmentReportPanel } from "@/components/client/organisms/EquipmentReportPanel";

import styles from "./Profile.module.scss";

export default function Profile() {
    // Estado para controlar la conmutación de vistas
    const [view, setView] = useState<"perfil" | "mantenimiento">("perfil");

    // Datos mockeados para visualizar los organismos (Luego vendrán de GraphQL)
    const mockData = {
        user: {
            name: "Gildder Alberto Caceres Urizar",
            initials: "G",
            role: "Administrador",
            locations: ["Zona 5", "Zona 7", "Zona 6", "Zona 1"],
            vacationDays: 15,
            stats: { entered: 150, solved: 120, inProgress: 1 }
        },
        equipment: {
            lastMaintenance: "24/11/2023",
            nextMaintenance: "24/11/2024",
            observations: "Ejemplo de una descripción de lo realizado al equipo.",
            percentage: 85,
                    items: [
                { 
                    iconName: "desktop-solid", 
                    title: "Monitor", 
                    description: "Dell 27 pulgadas", 
                    iconColor: "#6F87FB" 
                },
                { 
                    iconName: "keyboard-solid", 
                    title: "Teclado", 
                    description: "Microsoft e56a5", 
                    iconColor: "#99cc33" 
                },
                { 
                    iconName: "computer-solid", 
                    title: "CPU", 
                    description: "Dell icore 5", 
                    iconColor: "#FFB347" 
                },
                { 
                    iconName: "print-solid", 
                    title: "Impresora", 
                    description: "No asignada", 
                    iconColor: "#9C27B0" 
                },
                { 
                    iconName: "computer-mouse-solid", 
                    title: "Mouse", 
                    description: "Logitech 205", 
                    iconColor: "#D32F2F" 
                },
                { 
                    iconName: "fax-solid", 
                    title: "Fax", 
                    description: "No asignada", 
                    iconColor: "#2C3E50" 
                },
            ]
        }
    };

    return (
        <div className={styles.container}>
            {/* Header con Switch funcional */}
            <ProfileHeader 
                bannerSrc="/images/city.png"
                initials={mockData.user.initials}
                name={mockData.user.name}
                role={mockData.user.role}
                switchOptions={[
                    { label: 'Perfil', value: 'perfil' },
                    { label: 'Mantenimiento', value: 'mantenimiento' }
                ]}
                switchValue={view}
                onSwitchChange={(val) => setView(val as "perfil" | "mantenimiento")}
            />

            <div className={styles.content}>
                {view === "perfil" ? (
                    <div className={styles.viewLayout}>
                        <UserInfoPanel 
                            locations={mockData.user.locations}
                            vacationDays={mockData.user.vacationDays}
                        />
                        <UserPerformance 
                            enteredTickets={mockData.user.stats.entered}
                            solvedTickets={mockData.user.stats.solved}
                            inProgressTickets={mockData.user.stats.inProgress}
                        />
                    </div>
                ) : (
                    <div className={styles.viewLayout}>
                        <MaintenanceRecordPanel 
                            lastMaintenance={mockData.equipment.lastMaintenance}
                            nextMaintenance={mockData.equipment.nextMaintenance}
                            observations={mockData.equipment.observations}
                        />
                        <EquipmentReportPanel 
                            percentage={mockData.equipment.percentage}
                            items={mockData.equipment.items}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}