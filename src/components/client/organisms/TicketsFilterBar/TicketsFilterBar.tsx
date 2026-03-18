"use client";

import React, { useState } from "react";
import classNames from "classnames";
import { IconFilterTabs } from "../../molecules/IconFilterTabs";
import { MemberSelect } from "../../molecules/MemberSelect";
import { Button } from "../../atoms/Button";
import type { TicketsFilterBarProps } from "./types";
import styles from "./TicketsFilterBar.module.scss";

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
    members,
    selectedMemberId,
    onMemberSelect,
    disabled = false,
    className,
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleToggleFilter = () => {
        if (!disabled) {
            setIsFilterOpen(!isFilterOpen);
        }
    };

    return (
        <div className={classNames(styles.TicketsFilterBar, className)}>
            <IconFilterTabs
                options={filterOptions}
                value={selectedFilter}
                onChange={onFilterChange}
                disabled={disabled}
            />

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

                <MemberSelect
                    members={members}
                    selectedId={selectedMemberId}
                    onSelect={onMemberSelect}
                    isOpen={isFilterOpen}
                    onOpenChange={setIsFilterOpen}
                >
                    <Button
                        variant="outlined"
                        color="neutral-light"
                        icon="arrow-down-wide-short-gray"
                        left
                        onClick={handleToggleFilter}
                        state={disabled ? "disabled" : "default"}
                    >
                        Filtrar
                    </Button>
                </MemberSelect>
            </div>
        </div>
    );
};

export default TicketsFilterBar;
