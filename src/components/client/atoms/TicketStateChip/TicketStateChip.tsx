import React from "react";
import { TicketStateChipProps } from "./types";
import styles from "./TicketStateChip.module.scss";
import classNames from "classnames";

export const TicketStateChip = ({ 
    label, 
    variant = "default", 
    state = "ingresado", 
    className 
}: TicketStateChipProps) => {
    return (
        <div className={classNames(styles.chip, styles[variant], styles[state], className)}>
            {variant !== 'outlined' && <span className={styles.dot}></span>}
            <span className={styles.label}>{label}</span>
        </div>
    );
};

export default TicketStateChip;