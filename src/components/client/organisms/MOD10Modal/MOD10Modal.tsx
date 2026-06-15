import React from "react";

import { PopOver } from "@/components/client/atoms/PopOver";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";

import { MOD10ModalProps } from "./types";
import styles from "./MOD10Modal.module.scss";


const MOD10Modal: React.FC<MOD10ModalProps> = ({ isOpen, onClose, onSubmit, ...formData }) => {

    const renderField = (label: string, value: string | number) => (
        <div className={styles.field}>
            <Text variant="caption" className={styles.fieldLabel}>{label}</Text>
            <Text variant="body" className={styles.fieldValue}>{value ? value.toString() : "N/A"}</Text>
        </div>
    );

    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center" className={styles.popOver}>
            <div className={styles.mod10ModalContainer}>
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <Title variant="mid" className={styles.title}>Vista Previa Reporte</Title>
                    </div>
                    <Button variant="outlined" color="neutral-light" className={styles.closeButton} onClick={onClose}>
                        X
                    </Button>
                </div>
                <div className={styles.contentContainer}>
                    <div className={styles.content}>
                        <div className={styles.contentHeader}>
                            <Title variant="large">Notificación Oficial</Title>
                            <Text variant="caption">
                                Reciba un cordial saludo de la Policia Municipal de Tránsito de la Municipalidad de Guatemala. Por este medio nos dirigimos a usted con el objetivo de notificarle el documento siguiente.
                            </Text>
                            <Text variant="body" className={styles.documentText}>DOCUMENTO ADJUNTO EN PDF</Text>
                        </div>
                        <div className={styles.contentBody}>
                            <Text className={styles.fieldLabel}>DETALLE DE LA NOTIFICACIÓN</Text>
                            {renderField("Área:", formData.destinyArea)}
                            {renderField("De fecha:", formData.documentDate)}
                            {renderField("Emitido por:", formData.issuedBy)}
                            {renderField("Expediente No.:", formData.caseNumber)}
                            {renderField("Nombre:", formData.name)}
                            {renderField("Referente a:", formData.reference)}
                            {renderField("Número de Páginas:", formData.pageNumbers)}
                        </div>
                        <Text variant="caption" className={styles.note}>
                            Nota: Estimado(a) vecino(a), si tiene alguna duda puede presentarse a la 9na avenida 1-00, zona 12, Edificio Policía Municipal de Tránsito.
                        </Text>
                        <div className={styles.footerNote}>
                            <Text variant="body">
                                El documento descrito anteriormente se ha adjuntado al presente correo electrónico Atentamente,
                            </Text>
                            <Text variant="body" className={styles.signature}>
                                Policia Municipal de Tránsito - Municipalidad de Guatemala
                            </Text>
                            <Text variant="muted">
                                Notificación Electrónica, Acuerdo Municipal número COM-32-2022 y sus reformas. Por Favor no contestar el presente correo electrónico. Para cualquier duda puede acudir de manera presencial a la dependencia administrativa emisora o comunicarse con ella vía electrónica a traves de los medios oficiales.
                            </Text>
                        </div>
                    </div>
                </div>
                <div className={styles.footer}>
                    <Button variant="contained" color="neutral-light" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={() => onSubmit(formData)}>
                        Enviar
                    </Button>
                </div>
            </div>
        </PopOver>
    );
}

export default MOD10Modal;
