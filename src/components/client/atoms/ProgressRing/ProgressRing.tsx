"use client";
import { ProgressRingProps } from "./types";
import styles from "./ProgressRing.module.scss";
import classNames from "classnames";

export const ProgressRing = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    fontSize,
    className,
}: ProgressRingProps) => {
    // Cálculos para el SVG circular
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={classNames(styles.container, className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className={styles.svg}>
                {/* Círculo de fondo (Gris) */}
                <circle
                    className={styles.backgroundRing}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                className={styles.progressRing}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset: offset }}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                />
            </svg>
            {/* Texto central con el porcentaje */}
            <div className={styles.content}>
                <span 
                    className={styles.percentageText}
                    style={{ fontSize: fontSize || `${size * 0.2}px` }}
                >
                        {percentage} %           
                </span>
            </div>
        </div>
    );
};

export default ProgressRing;