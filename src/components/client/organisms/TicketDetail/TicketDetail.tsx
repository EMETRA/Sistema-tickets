import React from "react";

import { PopOver } from "@/components/client/atoms/PopOver";
import { Icon } from "@/components/client/atoms/Icon";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { File } from "@/components/client/atoms/File";
import { Button } from "@/components/client/atoms/Button";

import { Chat } from "@/components/client/organisms/Chat";
import { HistoryMessage } from "@/components/client/molecules/HistoryMessage";

import { useAuthStore } from "@/store/useAuthStore";

import styles from "./TicketDetail.module.scss";
import { TicketDetailProps, type TicketDetail } from "./types";

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, isOpen, onClose }) => {
    const { getRole } = useAuthStore();

    const ticketDetail: TicketDetail = {
        name: "Problema con el pedido #123",
        status: "resolved",
        description:
            "El producto llegó dañado y necesito un reemplazo. Por favor, ayúdenme a resolver este problema lo antes posible. Gracias. Adjunto una foto del producto dañado. Espero su pronta respuesta. Saludos. Agradezco de antemano su ayuda. Quedo atento a sus comentarios. Gracias por su atención. Espero una solución rápida. Saludos cordiales. Adjunto la factura de compra. Quedo a la espera de su respuesta. Gracias por su comprensión.",
        files: [
            { id: "file1", name: "captura_pantalla.png" },
            { id: "file2", name: "factura.pdf" }
        ]
    };

    const handleOnFileClick = (fileId: string) => {
        alert("Archivo clickeado: " + fileId);
    }

    const handleOnTicketCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        alert("Cancelar ticket");
    }

    const handleOnTicketProcess = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        alert("Poner ticket en proceso");
    }

    const handleOnTicketFinish = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        alert("Finalizar ticket");
    }

    return (
        <PopOver isOpen={isOpen} onClose={onClose} position="center" className={styles.popOver}>
            <div className={styles.ticketDetailContainer}>
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <Icon name="file" variant="status" color="#7F8D9F" />
                        <Title variant="mid" className={styles.title}>Ticket #{ticketId}</Title>
                    </div>
                    <Button variant="outlined" color="neutral-light" className={styles.closeButton} onClick={onClose}>
                        X
                    </Button>
                </div>
                <div className={styles.content}>
                    <div className={styles.ticketDetails}>
                        <div className={styles.ticketInfo}>
                            <div className={styles.ticketTitleInfo}>
                                <Text variant="muted">Asunto</Text>
                                <Title variant="large">{ticketDetail.name}</Title>
                            </div>
                            <div className={styles.ticketInfoDescription}>
                                <Text variant="muted">Descripción</Text>
                                <Text variant="body">{ticketDetail.description}</Text>
                            </div>
                            <div className={styles.ticketInfoFiles}>
                                {ticketDetail.files.map((file) => (
                                    <File
                                        key={file.id}
                                        id={file.id}
                                        name={file.name}
                                        onClick={(id) => handleOnFileClick(id)}
                                        variant="outlined"
                                    />
                                ))}
                            </div>
                        </div>
                        <Chat ticketId={ticketId} classname={styles.chat} />
                    </div>
                    <div className={styles.ticketHistory}>
                        <HistoryMessage ticketId={ticketId} />
                        {getRole() === "TECH" || getRole() === "DEV" && (
                            <div className={styles.ticketActions}>
                                {ticketDetail.status !== "canceled" && ticketDetail.status !== "resolved" ? (
                                    <Button variant="contained" color="danger" onClick={handleOnTicketCancel} fullWidth>
                                        Cancelar
                                    </Button>
                                ) : null}
                                {ticketDetail.status === "created" || ticketDetail.status === "assigned" ? (
                                    <Button variant="contained" color="default" onClick={handleOnTicketProcess} fullWidth>
                                        En Proceso
                                    </Button>
                                ) : ticketDetail.status === "in_progress" ? (
                                    <Button variant="contained" color="default" onClick={handleOnTicketFinish} fullWidth>
                                        Finalizado
                                    </Button>
                                ) : <Text variant="body" className={styles.noActionsText}>No hay acciones disponibles</Text>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PopOver>
    );
};

export default TicketDetail;
