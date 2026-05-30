import React from "react";

import { PopOver } from "@/components/client/atoms/PopOver";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";

import styles from "./SuccessModal.module.scss";
import { SuccessModalProps } from "./types";

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, title = "Éxito", message = "Operación realizada con éxito." }) => {
    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center" className={styles.popOver}>
            <div className={styles.successModalContainer}>
                <div className={styles.header}>
                    <Title variant="large" className={styles.title}>{title}</Title>
                </div>
                <div className={styles.contentContainer}>
                    <Text variant="body" className={styles.message}>{message}</Text>
                </div>
                <div className={styles.footer}>
                    <Button variant="contained" color="success" onClick={onClose}>
                        Aceptar
                    </Button>
                </div>
            </div>
        </PopOver>
    );
}

export default SuccessModal;
