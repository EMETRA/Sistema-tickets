"use client";

import React from "react";
import classNames from "classnames";
import { Icon } from "../../atoms/Icon";
import { AppIconProps } from "./types";
import styles from "./AppIcon.module.scss";

export const AppIcon = ({ icon, label, size = 24, color, className }: AppIconProps) => {
    return (
        <div className={classNames(styles.AppIcon, className)}>
            <div className={styles.iconWrapper}>
                <Icon name={icon} variant="status" size={size} color={color} />
            </div>
            <p className={styles.label}>
                {label}
            </p>
        </div>
    );
};

export default AppIcon;