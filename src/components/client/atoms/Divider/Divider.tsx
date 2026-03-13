import React from "react";
import styles from "./Divider.module.scss";
import classNames from "classnames";

interface DividerProps {
    orientation?: "horizontal" | "vertical";
    className?: string;
}

export const Divider = ({ orientation = "horizontal", className }: DividerProps) => {
    return (
        <div 
        className={classNames(styles.divider, styles[orientation], className)} 
        role="separator" 
        />
    );
};

export default Divider;