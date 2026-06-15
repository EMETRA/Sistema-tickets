import React from "react";
import { EquipmentReportPanelProps } from "./types";
import { ProgressRing } from "../../atoms/ProgressRing";
import { Text } from "../../atoms/Text";
import styles from "./EquipmentReportPanel.module.scss";
import classNames from "classnames";
import EquipmentItem from "../../molecules/EquipmentItem";
import { Title } from "../../atoms/Title";

export const EquipmentReportPanel = ({
    percentage,
    statusLabel = "Estado del equipo",
    items,
    className
}: EquipmentReportPanelProps) => {
    return (
        <div className={classNames(styles.reportCard, className)}>
            {/* Sección Izquierda: Estado Circular */}
            <div className={styles.statusSection}>
                <Title className={styles.title}>
                    Reporte Equipo
                </Title>
                
                <div className={styles.ringWrapper}>
                    <ProgressRing 
                        percentage={percentage} 
                        size={160} 
                        strokeWidth={12}
                    />
                </div>
                
                <Text variant="body" className={styles.statusText}>
                    {statusLabel}
                </Text>
            </div>

            {/* Divisor Vertical */}
            <div className={styles.divider} />

            {/* Sección Derecha: Grid de Equipos */}
            <div className={styles.gridSection}>
                {items.map((item, index) => (
                    <EquipmentItem 
                        key={index}
                        {...item}
                    />
                ))}
            </div>
        </div>
    );
};

export default EquipmentReportPanel;