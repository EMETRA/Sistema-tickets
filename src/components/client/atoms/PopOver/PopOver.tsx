"use client";
import { useEffect, useRef } from "react";
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
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const node = ref.current;
        if (!isOpen || !node) return;
        if (!node.open) {
            if (withOverlay) node.showModal();
            else node.show();
        }
        return () => {
            if (node.open) node.close();
        };
    }, [isOpen, withOverlay]);
    if (!isOpen) return null;
    return (
        <dialog
            ref={ref}
            aria-label="Ventana de la aplicación"
            className={classNames(styles.popoverContent, styles[position], className)}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (!withOverlay || event.target !== ref.current) return;
                const box = event.currentTarget.getBoundingClientRect();
                if (
                    event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
                )
                    onClose();
            }}
        >
            {children}
        </dialog>
    );
};
export default PopOver;
