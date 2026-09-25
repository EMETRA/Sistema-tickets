import React from "react";
import classNames from "classnames";
import { ModalContentProps } from "./types";
import { PopOver } from "../../atoms/PopOver";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import { Button } from "../../atoms/Button";
import styles from "./ModalContent.module.scss";

export const ModalContent = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    iconName = "circle-exclamation-solid",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    loading = false,
    variant = "default",
    align = "center",
}: ModalContentProps) => {
    // Mientras se procesa no se permite cerrar desde el overlay.
    const handleClose = () => {
        if (!loading) onClose();
    };

    if (variant === "compact") {
        return (
            <PopOver isOpen={isOpen} onClose={handleClose} position="center">
                <div className={classNames(styles.compactCard, { [styles.alignLeft]: align === "left" })}>
                    <div className={styles.compactText}>
                        <Text variant="body" className={styles.compactTitle}>
                            {title}
                        </Text>
                        <Text variant="muted" className={styles.compactDescription}>
                            {description}
                        </Text>
                    </div>

                    <div className={styles.compactActions}>
                        <Button
                            variant="contained"
                            color="danger"
                            onClick={handleClose}
                            state={loading ? "disabled" : "default"}
                            className={styles.compactButton}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={onConfirm}
                            state={loading ? "loading" : "default"}
                            className={styles.compactButton}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </PopOver>
        );
    }

    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center">
            <div className={styles.modalCard}>
                <div className={styles.iconWrapper}>
                    <Icon name={iconName} size={64} className={styles.mainIcon} />
                </div>

                <div className={styles.textWrapper}>
                    <Text variant="body" className={styles.title}>
                        {title}
                    </Text>
                    <Text variant="muted" className={styles.description}>
                        {description}
                    </Text>
                </div>

                <div className={styles.actions}>
                    <Button 
                        variant="contained" 
                        color="danger"
                        onClick={onConfirm}
                        state={loading ? "loading" : "default"}
                    >
                        {confirmLabel}
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="cancel" 
                        onClick={onClose}
                    >
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </PopOver>
    );
};

export default ModalContent;