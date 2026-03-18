"use client";

import React from "react";
import classNames from "classnames";
import { TableHeader } from "../../molecules/TableHeader";
import { ToggleButton } from "../../atoms/ToggleButton";
import { BarChart } from "../../atoms/BarChart";
import { PerformanceChartPanelProps, PrimaryFilter } from "./types";
import styles from "./PerformanceChartPanel.module.scss";

/**
 * Opciones de filtro para la variante primary
 */
const PRIMARY_FILTER_OPTIONS = [
    { label: "Anual", value: "annual" as PrimaryFilter },
    { label: "Mensual", value: "monthly" as PrimaryFilter },
    { label: "Semanal", value: "weekly" as PrimaryFilter },
    { label: "Hoy", value: "today" as PrimaryFilter },
];

/**
 * Componente PerformanceChartPanel - Panel de gráfico de rendimiento con filtros
 *
 * @param {PerformanceChartPanelProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente PerformanceChartPanel renderizado
 */
export const PerformanceChartPanel: React.FC<PerformanceChartPanelProps> = (props) => {
    const { variant, data, width = 700, height = 400, className } = props;

    // Renderizar variante primary
    if (variant === "primary") {
        const { selectedFilter, onFilterChange } = props;

        return (
            <div className={classNames(styles.PerformanceChartPanel, styles.primary, className)}>
                <div className={styles.header}>
                    <TableHeader
                        iconName="magnifying-glass-chart-solid"
                        label="Reporte de rendimiento"
                    />
                    <ToggleButton
                        variant="primary"
                        options={PRIMARY_FILTER_OPTIONS}
                        value={selectedFilter}
                        onChange={(value) => onFilterChange(value as PrimaryFilter)}
                    />
                </div>

                <div className={styles.chartContainer}>
                    <BarChart
                        data={data}
                        width={width}
                        height={height}
                        colorScheme="green-gradient"
                    />
                </div>
            </div>
        );
    }

    // Renderizar variante secondary
    const {
        filterConfig,
        selectedParentFilter,
        selectedChildFilter,
        onParentFilterChange,
        onChildFilterChange,
    } = props;

    // Obtener opciones hijas basadas en el padre seleccionado
    const childOptions = filterConfig.childOptionsByParent[selectedParentFilter] || [];

    return (
        <div className={classNames(styles.PerformanceChartPanel, styles.secondary, className)}>
            <div className={styles.parentFilters}>
                <ToggleButton
                    variant="secondary"
                    options={filterConfig.parentOptions}
                    value={selectedParentFilter}
                    onChange={onParentFilterChange}
                    maxVisibleOptions={6}
                    className={styles.ToggleButtonFather}
                />
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.childFilters}>
                    <ToggleButton
                        variant="secondary"
                        options={childOptions}
                        value={selectedChildFilter}
                        onChange={onChildFilterChange}
                        maxVisibleOptions={5}
                    />
                </div>

                <div className={styles.chartContainer}>
                    <BarChart
                        data={data}
                        width={width}
                        height={height}
                        colorScheme="green-gradient"
                    />
                </div>
            </div>
        </div>
    );
};

export default PerformanceChartPanel;
