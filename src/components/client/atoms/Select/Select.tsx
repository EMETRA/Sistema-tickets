"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import classNames from "classnames";
import styles from "./Select.module.scss";
import { SelectProps, SelectOption, SelectOptionGroup } from "./types";

/**
 * Componente de select reutilizable con diferentes estados.
 *
 * @param {SelectProps} props - Las propiedades del componente de select.
 * @returns {JSX.Element} El componente de select renderizado.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            state = "default",
            errorMessage,
            placeholder,
            options,
            ...props
        },
        ref
    ) => {
    // Referencia interna al select
        const selectRef = useRef<HTMLSelectElement>(null);

        // Combina la referencia interna con la referencia pasada
        useImperativeHandle(ref, () => selectRef.current as HTMLSelectElement, []);

        // Construir las clases CSS dinámicamente usando classnames
        const selectClasses = classNames(styles.Select, {
            [styles.SelectError]: state === "error",
            [styles.SelectDisabled]: state === "disabled",
        }, className);

        // Verificar si options tiene grupos
        const isGrouped = options.length > 0 && "options" in options[0];

        // Renderizar las opciones
        const renderOptions = () => {
            if (isGrouped) {
                // Opciones agrupadas
                return (options as SelectOptionGroup[]).map((group, groupIndex) => (
                    <optgroup key={groupIndex} label={group.label}>
                        {group.options.map((option) => (
                            <option
                                className={styles.option}
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </optgroup>
                ));
            } else {
                // Opciones simples
                return (options as SelectOption[]).map((option) => (
                    <option
                        className={styles.option}
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ));
            }
        };

        return (
            <div className={styles.Wrapper}>
                <div className={styles.SelectContainer}>
                    <select
                        ref={selectRef}
                        className={selectClasses}
                        disabled={state === "disabled"}
                        {...props}
                    >
                        {placeholder && (
                            <option className={styles.option} value="" disabled hidden>
                                {placeholder}
                            </option>
                        )}
                        {renderOptions()}
                    </select>
                </div>
                {state === "error" && errorMessage && (
                    <span className={styles.ErrorMessage}>{errorMessage}</span>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

export default Select;
