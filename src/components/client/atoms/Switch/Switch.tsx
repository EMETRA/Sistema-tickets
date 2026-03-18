"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import classNames from "classnames";
import styles from "./Switch.module.scss";
import { SwitchProps } from "./types";

/**
 * Componente de switch reutilizable con diferentes estados.
 *
 * @param {SwitchProps} props - Las propiedades del componente de switch.
 * @returns {JSX.Element} El componente de switch renderizado.
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, state = "default", errorMessage, label, id, switchSize = "medium", ...props }, ref) => {
    // Referencia interna al switch
        const switchRef = useRef<HTMLInputElement>(null);

        // Combina la referencia interna con la referencia pasada
        useImperativeHandle(ref, () => switchRef.current as HTMLInputElement, []);

        // Generar un ID único si no se proporciona
        const switchId = id || `switch-${label}`;

        // Construir las clases CSS dinámicamente usando classnames
        const containerClasses = classNames(styles.Container, {
            [styles.ContainerError]: state === "error",
            [styles.ContainerDisabled]: state === "disabled",
        }, className);

        // Dimensiones predefinidas para cada tamaño
        const sizeConfig = {
            small: { width: 40, height: 20, sliderSize: 16, padding: 2 },
            medium: { width: 50, height: 26, sliderSize: 20, padding: 3 },
            large: { width: 62, height: 32, sliderSize: 26, padding: 3 },
        };

        const config = sizeConfig[switchSize];
        const translateX = config.width - config.sliderSize - (config.padding * 2);

        return (
            <div className={styles.Wrapper}>
                <label htmlFor={switchId} className={containerClasses}>
                    <input
                        ref={switchRef}
                        type="checkbox"
                        id={switchId}
                        className={styles.HiddenSwitch}
                        disabled={state === "disabled"}
                        {...props}
                    />
                    <span 
                        className={styles.StyledSwitch}
                        style={{
                            width: config.width,
                            height: config.height,
                            borderRadius: config.height / 2,
                        }}
                    >
                        <span 
                            className={styles.Slider}
                            style={{
                                width: config.sliderSize,
                                height: config.sliderSize,
                                top: config.padding,
                                left: config.padding,
                                '--translate-x': `${translateX}px`,
                            } as React.CSSProperties}
                        ></span>
                    </span>
                    {label && <span className={styles.Label}>{label}</span>}
                </label>
                {state === "error" && errorMessage && (
                    <span className={styles.ErrorMessage}>{errorMessage}</span>
                )}
            </div>
        );
    }
);

Switch.displayName = "Switch";

export default Switch;
