"use client";

import React from "react";
import classNames from "classnames";
import { IconFilterTabs } from "../../molecules/IconFilterTabs";
import { Button } from "../../atoms/Button";
import type { TicketsFilterBarProps } from "./types";
import styles from "./TicketsFilterBar.module.scss";

import { useAuthStore } from "@/store/useAuthStore";

/**
 * Componente TicketsFilterBar - Barra de filtros y acciones para tickets
 *
 * @param {TicketsFilterBarProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketsFilterBar renderizado
 */
export const TicketsFilterBar: React.FC<TicketsFilterBarProps> = ({
    filterOptions = [],
    selectedFilter,
    onFilterChange,
    onExport,
    disabled = false,
    className,
}) => {
    const { getRole } = useAuthStore();

    const filterByRole = (options: TicketsFilterBarProps["filterOptions"]): TicketsFilterBarProps["filterOptions"] => {
        const role = getRole();

        if (role === "ADMINISTRADOR") {
            return options; // Sin filtrar para ADMINISTRADOR
        }

        if (role === "TECNICO" || role === "DESARROLLADOR") {
            return options.filter(option => option.value === "asignado" || option.value === "completado" || option.value === "cancelado") || []; // Solo "Asignados", "Finalizados" y "Cancelados" para TECNICO y DESARROLLADOR
        }

        return options.filter(option => option.value === "cancelado") || []; // Solo "Asignados" para USUARIO
    }

    return (
        <div className={classNames(styles.TicketsFilterBar, className)}>
            <IconFilterTabs
                options={filterByRole(filterOptions)}
                value={selectedFilter}
                onChange={onFilterChange}
                disabled={disabled}
            />

            {getRole() === "ADMINISTRADOR" || getRole() === "TECNICO" || getRole() === "DESARROLLADOR" ? (
                <div className={styles.actions}>
                    <Button
                        variant="contained"
                        color="success"
                        icon="file-excel-regular"
                        left
                        onClick={onExport}
                        state={disabled ? "disabled" : "default"}
                    >
                        Exportar
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default TicketsFilterBar;
