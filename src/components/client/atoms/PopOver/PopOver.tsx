"use client";
import { PopOverProps } from "./types";
import styles from "./PopOver.module.scss";
import classNames from "classnames";

export const PopOver = ({
    isOpen,
    onClose,
    children,
    position = "center",
    withOverlay = true,
    className,
}: PopOverProps) => {
    if (!isOpen) return null;

    return (
        <>
        {withOverlay && <div className={styles.overlay} onClick={onClose} />}
        <div className={classNames(styles.popoverContent, styles[position], className)}>
            {children}
        </div>
        </>
    );
};

export default PopOver;