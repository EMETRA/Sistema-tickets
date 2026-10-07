import React from "react";
import { ChipProps } from "./types";
import styles from "./Chip.module.scss";
import classNames from "classnames";

export const Chip = ({
    label,
    variant = "default",
    color,
    className
}: ChipProps) => {
    const style = color
        ? ({ "--chip-color": color } as React.CSSProperties)
        : undefined;

    return (
        <div className={classNames(styles.chip, styles[variant], className)} style={style}>
            <span className={styles.label}>{label}</span>
        </div>
    );
};

export default Chip;
