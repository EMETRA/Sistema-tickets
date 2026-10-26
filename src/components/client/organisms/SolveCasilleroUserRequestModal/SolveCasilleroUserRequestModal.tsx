import React from "react";

import { PopOver } from "@/components/client/atoms/PopOver";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";

import { SolveCasilleroUserRequestModalProps } from "./types";
import styles from "./SolveCasilleroUserRequestModal.module.scss";


const SolveCasilleroUserRequestModal: React.FC<SolveCasilleroUserRequestModalProps> = ({ isOpen, onClose, approve, onSubmit, email, userType, name }) => {

    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center" className={styles.popOver}>
            <div className={styles.solveCasilleroUserRequestModalContainer}>
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <Title variant="mid" className={styles.title}>{approve ? "Aprobar" : "Rechazar"} solicitud de usuario</Title>
                    </div>
                    <Button variant="outlined" color="neutral-light" className={styles.closeButton} onClick={onClose}>
                        X
                    </Button>
                </div>

                <div className={styles.content}>
                    <Text variant="body">¿Estás seguro de querer {approve ? "aprobar" : "rechazar"} la solicitud de usuario <strong>{userType === "individual" ? name : email}</strong>?</Text>
                    <Text variant="body"><strong>Nota:</strong> Esta acción no se puede deshacer.</Text>
                </div>

                <div className={styles.footer}>
                    <Button variant="contained" color="neutral-light" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={() => onSubmit()} color={approve ? "success" : "danger"}>
                        {approve ? "Aprobar" : "Rechazar"}
                    </Button>
                </div>
            </div>
        </PopOver>
    );
}

export default SolveCasilleroUserRequestModal;
