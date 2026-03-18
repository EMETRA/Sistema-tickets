"use client";

import React from "react";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { EventItem } from "../../molecules/EventItem";
import { InfoPanelProps, InfoPanelType } from "./types";
import { IconName } from "../../atoms/Icon/types";
import styles from "./InfoPanel.module.scss";

/**
 * Configuración de headers por tipo de panel
 */
const PANEL_CONFIG: Record<InfoPanelType, { iconName: IconName; label: string }> = {
    team: {
        iconName: "users-solid",
        label: "Equipo - Últimos movimientos",
    },
    "my-activity": {
        iconName: "clock-rotate-left-solid",
        label: "Mi actividad",
    },
    "upcoming-events": {
        iconName: "clock-rotate-left-solid",
        label: "Próximos eventos",
    },
};

/**
 * Componente InfoPanel - Panel de información con lista de eventos o movimientos
 *
 * @param {InfoPanelProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente InfoPanel renderizado
 */
export const InfoPanel: React.FC<InfoPanelProps> = ({
    type,
    items,
    className,
}) => {
    const config = PANEL_CONFIG[type];
    const showDividers = type === "upcoming-events";

    // Limitar a máximo 10 items
    const limitedItems = items.slice(0, 10);

    return (
        <div className={classNames(styles.InfoPanel, className)}>
            <TableHeader 
                iconName={config.iconName} 
                label={config.label} 
                className={styles.header}
            />
      
            <div className={styles.itemsContainer}>
                {limitedItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <EventItem {...item} className={styles.item} />
                        {showDividers && index < limitedItems.length - 1 && (
                            <div className={styles.divider} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default InfoPanel;
