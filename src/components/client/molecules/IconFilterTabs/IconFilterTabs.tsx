"use client";

import React from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import type { IconFilterTabsProps, FilterOption } from "./types";
import styles from "./IconFilterTabs.module.scss";

/**
 * Opción "Todos" que siempre se muestra primero
 */
const ALL_OPTION: FilterOption = {
    label: "Todos",
    value: "all",
    icon: "ticket-solid",
};

/**
 * Componente IconFilterTabs - Filtros con íconos estilo tabs
 *
 * @param {IconFilterTabsProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente IconFilterTabs renderizado
 */
export const IconFilterTabs: React.FC<IconFilterTabsProps> = ({
    options = [],
    value,
    onChange,
    disabled = false,
    className,
}) => {
    // Combinar la opción "Todos" con las demás opciones
    const allOptions = [ALL_OPTION, ...options];

    const handleClick = (optionValue: string) => {
        if (!disabled && onChange) {
            onChange(optionValue);
        }
    };

    return (
        <div
            className={classNames(styles.IconFilterTabs, {
                [styles["IconFilterTabs--disabled"]]: disabled,
            }, className)}
        >
            {allOptions.map((option) => {
                const isSelected = option.value === value;

                return (
                    <Button
                        key={option.value}
                        variant={isSelected ? "contained" : "text"}
                        color="default"
                        icon={option.icon}
                        left
                        onClick={() => handleClick(option.value)}
                        state={disabled ? "disabled" : "default"}
                        className={classNames(styles.IconFilterTabs__button, {
                            [styles["IconFilterTabs__button--selected"]]: isSelected,
                            [styles["IconFilterTabs__button--unselected"]]: !isSelected,
                        })}
                    >
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
};

export default IconFilterTabs;
