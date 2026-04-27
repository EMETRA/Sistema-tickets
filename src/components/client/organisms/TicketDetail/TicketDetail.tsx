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

import { useGetTicketById } from "@/api/hooks";
import { useGetTicketAttachments } from "@/api/hooks";

import styles from "./TicketDetail.module.scss";
import { TicketDetailProps, type TicketDetail } from "./types";

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, isOpen, onClose }) => {
    const { getRole } = useAuthStore();

    const { data: ticketData, loading: isTicketLoading } = useGetTicketById(ticketId);
    const { data: ticketAttachments, loading: isTicketAttachmentsLoading } = useGetTicketAttachments(ticketId);

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
                        {isTicketLoading ? (
                            <p>Cargando detalles del ticket...</p>
                        ) : ticketData ? (
                            <div className={styles.ticketInfo}>
                                <div className={styles.ticketTitleInfo}>
                                    <Text variant="muted">Asunto</Text>
                                    <Title variant="large">{ticketData.titulo}</Title>
                                </div>
                                <div className={styles.ticketInfoDescription}>
                                    <Text variant="muted">Descripción</Text>
                                    <Text variant="body">{ticketData.descripcion}</Text>
                                </div>
                                <div className={styles.ticketInfoFiles}>
                                    {isTicketAttachmentsLoading ? (
                                        <p>Cargando archivos adjuntos...</p>
                                    ) : ticketAttachments.length === 0 ? (
                                        <p>No hay archivos adjuntos.</p>
                                    ) : (
                                        ticketAttachments.map((file) => (
                                            <File
                                                key={file.id}
                                                id={file.id}
                                                name={file.nombreArchivo || "Archivo adjunto"}
                                                onClick={(id) => handleOnFileClick(id)}
                                                variant="outlined"
                                            />
                                        )))}
                                </div>
                            </div>
                        ) : (
                            <p>No se encontraron detalles para este ticket.</p>
                        )}
                        <Chat ticketId={ticketId} classname={styles.chat} />
                    </div>
                    {ticketData && (
                        <div className={styles.ticketHistory}>
                            <HistoryMessage ticketId={ticketId} />
                            {getRole() === "TECH" || getRole() === "DEV" && (
                                <div className={styles.ticketActions}>
                                    {ticketData.estadoId !== "canceled" && ticketData.estadoId !== "resolved" ? (
                                        <Button variant="contained" color="danger" onClick={handleOnTicketCancel} fullWidth>
                                            Cancelar
                                        </Button>
                                    ) : null}
                                    {ticketData.estadoId === "created" || ticketData.estadoId === "assigned" ? (
                                        <Button variant="contained" color="default" onClick={handleOnTicketProcess} fullWidth>
                                            En Proceso
                                        </Button>
                                    ) : ticketData.estadoId === "in_progress" ? (
                                        <Button variant="contained" color="default" onClick={handleOnTicketFinish} fullWidth>
                                            Finalizado
                                        </Button>
                                    ) : <Text variant="body" className={styles.noActionsText}>No hay acciones disponibles</Text>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PopOver>
    );
};

export default TicketDetail;
