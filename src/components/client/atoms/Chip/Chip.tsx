import React from "react";
import { ChipProps } from "./types";
import styles from "./Chip.module.scss";
import classNames from "classnames";

export const Chip = ({ 
    label, 
    variant = "default", 
    state = "active", 
    className 
}: ChipProps) => {
    return (
    <div className={classNames(styles.chip, styles[variant], styles[state], className)}>
        {variant !== 'outlined' && <span className={styles.dot}></span>}
        <span className={styles.label}>{label}</span>
    </div>
    );
};

export default Chip;