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

import { useAddTagToTicket, useGetTicketById, useGetTicketTagCatalog, useGetTicketTags, useRemoveTagFromTicket } from "@/api/hooks";
import { useGetTicketAttachments } from "@/api/hooks";

import styles from "./TicketDetail.module.scss";
import { TicketDetailProps, type TicketDetail } from "./types";
import { MarkdownViewer } from "../../atoms/MarkdownViewer";
import { LabelChipGroup, LabelOption } from "../../molecules/LabelChipGroup";

const COLOR_MAP: Record<string, string> = {
    ROJO: "#e53935",
    CELESTE: "#00BCD4",
    MORADO: "#9C27B0",
    NARANJA: "#FB8C00",
    AMARILLO: "#FDD835",
};

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, isOpen, onClose }) => {
    const role = useAuthStore((state) => state.getRole());
    const { data: ticketData, loading: isTicketLoading } = useGetTicketById(ticketId);
    const { data: ticketAttachments, loading: isTicketAttachmentsLoading } = useGetTicketAttachments(ticketId);
    const { data: ticketTags, refetch: refetchTags, loading: isTagsLoading } = useGetTicketTags(ticketId);
    const { data: tagCatalog } = useGetTicketTagCatalog();
    const { addTag } = useAddTagToTicket();
    const { removeTag } = useRemoveTagFromTicket();

    const labels: LabelOption[] = ticketTags.map(tag => ({
        value: tag.id,
        label: tag.nombre,
        color: "#ffffff",
        backgroundColor: COLOR_MAP[tag.color ?? ""] ?? tag.color ?? undefined,
    }));


    const availableOptions: LabelOption[] = tagCatalog.map(tag => ({
        value: tag.id,
        label: tag.nombre,
        color: "#ffffff",
        backgroundColor: COLOR_MAP[tag.color ?? ""] ?? tag.color ?? undefined,
    }));


    const handleLabelsChange = async (newLabels: LabelOption[]) => {
        const currentIds = ticketTags.map(t => t.id);
        const newIds = newLabels.map(l => l.value);

        const added = newIds.filter(id => !currentIds.includes(id));
        const removed = currentIds.filter(id => !newIds.includes(id));

        try {
            await Promise.all([
                ...added.map(id => addTag(ticketId, parseInt(id, 10))),
                ...removed.map(id => removeTag(ticketId, parseInt(id, 10))),
            ]);
            await refetchTags();
        } catch (err) {
            console.error("Error actualizando etiquetas:", err);
        }
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
                <div className={role === "USUARIO" ? styles.contentFullWidth : styles.content}>
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
                                    <MarkdownViewer content={ticketData.descripcion} />
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
                    {role !== "USUARIO" && ticketData && (
                        <div className={styles.ticketHistory}>
                            {isTagsLoading ? (
                                <p>Cargando etiquetas...</p>
                            ) : (
                                <LabelChipGroup
                                    role={role}
                                    labels={labels}
                                    availableOptions={availableOptions}
                                    onChange={handleLabelsChange}
                                />
                            )}
                            <HistoryMessage ticketId={ticketId} />
                            <div className={styles.ticketActions}>
                                {ticketData.estadoNombre.toLowerCase() !== "cancelado" && ticketData.estadoNombre.toLowerCase() !== "completado" ? (
                                    <Button variant="contained" color="danger" onClick={handleOnTicketCancel} fullWidth>
                                        Cancelar
                                    </Button>
                                ) : null}
                                {ticketData.estadoNombre.toLowerCase() === "creado" || ticketData.estadoNombre.toLowerCase() === "asignados" ? (
                                    <Button variant="contained" color="default" onClick={handleOnTicketProcess} fullWidth>
                                        En Proceso
                                    </Button>
                                ) : ticketData.estadoNombre.toLowerCase() === "en trabajo" ? (
                                    <Button variant="contained" color="default" onClick={handleOnTicketFinish} fullWidth>
                                        Finalizado
                                    </Button>
                                ) : <Text variant="body" className={styles.noActionsText}>No hay acciones disponibles</Text>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PopOver>
    );
};

export default TicketDetail;
