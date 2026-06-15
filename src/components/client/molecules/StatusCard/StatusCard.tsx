"use client";

import React from "react";
import styles from "./StatusCard.module.scss";
import classNames from "classnames";
import { Text } from "../../atoms/Text";

type StatusVariant = "green" | "yellow" | "red" | "blue";

export interface StatusCardProps {
    label: string;
    value: number | string;
    variant: StatusVariant;
    className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({ label, value, variant, className }) => {
    return (
        <div className={classNames(styles.StatusCard, styles[variant], className)}>
            <Text className={styles.label}>{label}</Text>
            <Text className={styles.value}>{value}</Text>
        </div>
    );
};

export default StatusCard;  