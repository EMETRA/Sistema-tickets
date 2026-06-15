import React from "react";
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
    loading = false
}: ModalContentProps) => {
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