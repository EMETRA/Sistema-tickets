"use client";

import React from "react";
import classNames from "classnames";
import { StatInLineProps, STAT_INLINE_CONFIG } from "./types";
import styles from "./StatInLine.module.scss";

/**
 * Componente StatInLine - Muestra una estadística en formato vertical (label y valor)
 *
 * @param {StatInLineProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente StatInLine renderizado
 */
export const StatInLine: React.FC<StatInLineProps> = (props) => {
    const { label, value, size = "small", className } = props;

    // Determinar color según si usa type predefinido o valor custom
    const color = props.type ? STAT_INLINE_CONFIG[props.type].color : props.color;

    return (
        <div className={classNames(styles.StatInLine, styles[size], className)}>
            <p className={styles.Label}>{label}</p>
            <p className={styles.Value} style={{ color }}>
                {value.toLocaleString()}
            </p>
        </div>
    );
};

export default StatInLine;
