"use client";

import React, { forwardRef, useState, useMemo } from "react";
import classNames from "classnames";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import type { ToggleButtonProps } from "./types";
import styles from "./ToggleButton.module.scss";

export const ToggleButton = forwardRef<HTMLDivElement, ToggleButtonProps>(
    ({ options, value, onChange, disabled = false, variant = "primary", maxVisibleOptions, className }, ref) => {
        const [startIndex, setStartIndex] = useState(0);

        // Determinar el color del botón según la variante
        const selectedButtonColor = variant === "primary" ? "default" : "neutral-light";

        // Determinar si requiere navegación
        const needsNavigation = maxVisibleOptions && maxVisibleOptions < options.length;

        // Opciones visibles actuales
        const visibleOptions = useMemo(() => {
            if (!needsNavigation) {
                return options;
            }
            return options.slice(startIndex, startIndex + maxVisibleOptions);
        }, [options, startIndex, maxVisibleOptions, needsNavigation]);

        // Manejar navegación
        const handlePrevious = () => {
            if (startIndex > 0) {
                setStartIndex(startIndex - 1);
            }
        };

        const handleNext = () => {
            if (maxVisibleOptions && startIndex + maxVisibleOptions < options.length) {
                setStartIndex(startIndex + 1);
            }
        };

        const handleClick = (optionValue: string) => {
            if (!disabled && onChange) {
                onChange(optionValue);
            }
        };

        const canGoPrevious = startIndex > 0;
        const canGoNext = maxVisibleOptions ? startIndex + maxVisibleOptions < options.length : false;

        return (
            <div
                ref={ref}
                className={classNames(styles.ToggleButton, {
                    [styles["ToggleButton--disabled"]]: disabled,
                    [styles["ToggleButton--withNavigation"]]: needsNavigation,
                }, className)}
            >
                {needsNavigation && (
                    <IconButton
                        icon="angle-left-solid"
                        size={20}
                        disabled={!canGoPrevious || disabled}
                        onClick={handlePrevious}
                        borderless
                        className={styles.ToggleButton__navButton}
                    />
                )}

                <div key={startIndex} className={styles.ToggleButton__options}>
                    {visibleOptions.map((option) => {
                        const isSelected = option.value === value;

                        if (isSelected) {
                            return (
                                <Button
                                    key={option.value}
                                    variant="contained"
                                    color={selectedButtonColor}
                                    rounded
                                    onClick={() => handleClick(option.value)}
                                    state={disabled ? "disabled" : "default"}
                                >
                                    {option.label}
                                </Button>
                            );
                        }

                        return (
                            <button
                                key={option.value}
                                type="button"
                                className={styles.ToggleButton__unselected}
                                onClick={() => handleClick(option.value)}
                                disabled={disabled}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>

                {needsNavigation && (
                    <IconButton
                        icon="angle-right-solid"
                        size={20}
                        disabled={!canGoNext || disabled}
                        onClick={handleNext}
                        borderless
                        className={styles.ToggleButton__navButton}
                    />
                )}
            </div>
        );
    }
);

ToggleButton.displayName = "ToggleButton";
