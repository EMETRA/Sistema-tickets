"use client";

import React from "react";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { DonutChart } from "../../atoms/DonutChart";
import { TicketsResolvePanelProps } from "./types";
import styles from "./TicketsResolvePanel.module.scss";

/**
 * Componente TicketsResolvePanel - Panel que muestra tickets resueltos en gráfico de dona
 *
 * @param {TicketsResolvePanelProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketsResolvePanel renderizado
 */
export const TicketsResolvePanel: React.FC<TicketsResolvePanelProps> = ({
    data,
    size = 250,
    strokeWidth = 30,
    className,
}) => {
    return (
        <div className={classNames(styles.TicketsResolvePanel, className)}>
            <TableHeader 
                iconName="ranking-star-solid" 
                label="Tickets Resueltos" 
                className={styles.header}
            />
      
            <div className={styles.chartContainer}>
                <DonutChart 
                    data={data} 
                    size={size} 
                    strokeWidth={strokeWidth}
                />
            </div>
        </div>
    );
};

export default TicketsResolvePanel;
