"use client";

import React from "react";
import classNames from "classnames";
import styles from "./StatusChip.module.scss";

export type StatusChipVariant = "verde" | "amarillo" | "rojo";

interface StatusChipProps {
    variant: StatusChipVariant;
    className?: string;
}

const LABELS: Record<StatusChipVariant, string> = {
    verde: "VERDE",
    amarillo: "AMARILLO",
    rojo: "ROJO",
};

export const StatusChip: React.FC<StatusChipProps> = ({ variant, className }) => {
    return (
        <span className={classNames(styles.StatusChip, styles[variant], className)}>
            {LABELS[variant]}
        </span>
    );
};

export default StatusChip;