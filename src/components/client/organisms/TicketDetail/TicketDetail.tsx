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

import { useAddTagToTicket, useGetTicketById, useGetTicketTagCatalog, useGetTicketTags, useRemoveTagFromTicket, useUpdateTicket } from "@/api/hooks";
import { useGetTicketAttachments } from "@/api/hooks";

import styles from "./TicketDetail.module.scss";
import { TicketDetailProps } from "./types";
import { MarkdownViewer } from "../../atoms/MarkdownViewer";
import { LabelChipGroup, LabelOption } from "../../molecules/LabelChipGroup";

const COLOR_MAP: Record<string, string> = {
    ROJO: "#e53935",
    CELESTE: "#00BCD4",
    MORADO: "#9C27B0",
    NARANJA: "#FB8C00",
    AMARILLO: "#FDD835",
};

const TicketDetail: React.FC<TicketDetailProps> = ({ ticketId, isOpen, onClose, onTicketUpdated }) => {
    const role = useAuthStore((state) => state.getRole());
    const { updateTicket, loading: isUpdating } = useUpdateTicket();
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

    const handleOnFileClick = (url_descarga: string) => {
        window.open(url_descarga, "_blank");
    }

    const handleOnTicketCancel = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await updateTicket(ticketId, { estadoId: 4 });
            onTicketUpdated?.();
            onClose();
        } catch (err) {
            console.error("Error cancelando ticket:", err);
        }
    };

    const handleOnTicketProcess = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await updateTicket(ticketId, { estadoId: 3 }); // En trabajo
            onTicketUpdated?.();
            onClose();
        } catch (err) {
            console.error("Error poniendo ticket en proceso:", err);
        }
    };

    const handleOnTicketFinish = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            await updateTicket(ticketId, { estadoId: 5 }); // Completado
            onTicketUpdated?.();
            onClose();
        } catch (err) {
            console.error("Error finalizando ticket:", err);
        }
    };

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
                            <div>Cargando detalles del ticket...</div>
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
                                        <div>Cargando archivos adjuntos...</div>
                                    ) : ticketAttachments.length === 0 ? (
                                        <div>No hay archivos adjuntos.</div>
                                    ) : (
                                        ticketAttachments.map((file) => (
                                            <File
                                                key={file.id}
                                                id={file.id}
                                                name={file.nombreArchivo || "Archivo adjunto"}
                                                onClick={() => handleOnFileClick(file.url_descarga || "")}
                                                variant="outlined"
                                            />
                                        )))}
                                </div>
                            </div>
                        ) : (
                            <div>No se encontraron detalles para este ticket.</div>
                        )}
                        <Chat ticketId={ticketId} classname={styles.chat} />
                    </div>
                    {role !== "USUARIO" && ticketData && (
                        <div className={styles.ticketHistory}>
                            {isTagsLoading ? (
                                <div>Cargando etiquetas...</div>
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
                                {ticketData.estadoNombre.toLowerCase() !== "asignado" && ticketData.estadoNombre.toLowerCase() !== "completado" && ticketData.estadoNombre.toLowerCase() !== "cancelado" ? (
                                    <Button
                                        variant="contained"
                                        color="danger"
                                        onClick={handleOnTicketCancel}
                                        fullWidth
                                        state={isUpdating ? "loading" : "default"}
                                    >
                                        {isUpdating ? "Cancelando..." : "Cancelado"}
                                    </Button>
                                ) : null}

                                {ticketData.estadoNombre.toLowerCase() === "creado" || ticketData.estadoNombre.toLowerCase() === "asignado" ? (
                                    <Button
                                        variant="contained"
                                        color="default"
                                        onClick={handleOnTicketProcess}
                                        fullWidth
                                        state={isUpdating ? "loading" : "default"}
                                    >
                                        {isUpdating ? "Actualizando..." : "En Proceso"}
                                    </Button>
                                ) : ticketData.estadoNombre.toLowerCase() === "en trabajo" ? (
                                    <Button
                                        variant="contained"
                                        color="default"
                                        onClick={handleOnTicketFinish}
                                        fullWidth
                                        state={isUpdating ? "loading" : "default"}
                                    >
                                        {isUpdating ? "Finalizando..." : "Finalizado"}
                                    </Button>
                                ) : (
                                    <Text variant="body" className={styles.noActionsText}>
                                        No hay acciones disponibles
                                    </Text>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PopOver>
    );
};

export default TicketDetail;
