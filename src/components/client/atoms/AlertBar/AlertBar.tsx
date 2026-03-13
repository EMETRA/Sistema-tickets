"use client";

import React from "react";
import { AlertBarProps } from "./types";
import styles from "./AlertBar.module.scss";
import classNames from "classnames";

const AlertBar = ({ duration, color, className }: AlertBarProps) => {
    const dynamicStyles: React.CSSProperties = {
        animationDuration: `${duration}s`,
        ...(color && { backgroundColor: color }),
    };

    return (
    <div className={classNames(styles.container, className)} role="progressbar">
        <div 
            className={styles.bar} 
            style={dynamicStyles}
        />
    </div>
    );
};

export default AlertBar;