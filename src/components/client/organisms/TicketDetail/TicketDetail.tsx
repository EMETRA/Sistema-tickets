import React, { useId, useState } from "react";
import Link from "next/link";
import { TicketStateChip } from "../../atoms/TicketStateChip";
import type { ChipState } from "../../atoms/TicketStateChip/types";
import { displayDate } from "../ResourceWorkspace/RecordDetail";
import { FileViewer, type ViewedFile } from "../FileViewer/FileViewer";

import { PopOver } from "@/components/client/atoms/PopOver";
import { File } from "@/components/client/atoms/File";
import { Button } from "@/components/client/atoms/Button";

import { Chat } from "@/components/client/organisms/Chat";
import { HistoryMessage } from "@/components/client/molecules/HistoryMessage";

import { useAuthStore } from "@/store/useAuthStore";

import {
    useAddTagToTicket,
    useGetTicketById,
    useGetTicketTagCatalog,
    useGetTicketTags,
    useRemoveTagFromTicket,
    useUpdateTicket,
} from "@/api/hooks";
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

const TicketDetailContent: React.FC<TicketDetailProps> = ({
    ticketId,
    isOpen,
    onClose,
    onTicketUpdated,
    presentation = "dialog",
    returnHref = "/mis-tickets",
}) => {
    const [tab, setTab] = useState("conversacion");
    const [actionError, setActionError] = useState("");
    const [viewedFile, setViewedFile] = useState<ViewedFile | null>(null);
    const tabsId = useId();
    const role = useAuthStore((state) => state.getRole());
    const { updateTicket, loading: isUpdating } = useUpdateTicket();
    const {
        data: ticketData,
        loading: isTicketLoading,
        error: ticketError,
        refetch: refetchTicket,
    } = useGetTicketById(ticketId);
    const {
        data: ticketAttachments,
        loading: isTicketAttachmentsLoading,
        error: attachmentsError,
        refetch: refetchAttachments,
    } = useGetTicketAttachments(ticketId);
    const {
        data: ticketTags,
        refetch: refetchTags,
        loading: isTagsLoading,
    } = useGetTicketTags(ticketId);
    const { data: tagCatalog } = useGetTicketTagCatalog();
    const { addTag } = useAddTagToTicket();
    const { removeTag } = useRemoveTagFromTicket();

    const labels: LabelOption[] = ticketTags.map((tag) => ({
        value: tag.id,
        label: tag.nombre,
        color: "#ffffff",
        backgroundColor: COLOR_MAP[tag.color ?? ""] ?? tag.color ?? undefined,
    }));

    const availableOptions: LabelOption[] = tagCatalog.map((tag) => ({
        value: tag.id,
        label: tag.nombre,
        color: "#ffffff",
        backgroundColor: COLOR_MAP[tag.color ?? ""] ?? tag.color ?? undefined,
    }));

    const handleLabelsChange = async (newLabels: LabelOption[]) => {
        const currentIds = ticketTags.map((t) => t.id);
        const newIds = newLabels.map((l) => l.value);

        const added = newIds.filter((id) => !currentIds.includes(id));
        const removed = currentIds.filter((id) => !newIds.includes(id));

        try {
            await Promise.all([
                ...added.map((id) => addTag(ticketId, parseInt(id, 10))),
                ...removed.map((id) => removeTag(ticketId, parseInt(id, 10))),
            ]);
            await refetchTags();
        } catch (err) {
            setActionError(
                "No se pudieron actualizar las etiquetas. Reintenta la operación.",
            );
            console.error("Error actualizando etiquetas:", err);
        }
    };


    const handleOnTicketCancel = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        setActionError("");
        try {
            const updated = await updateTicket(ticketId, { estadoId: 4 });
            if (!updated) throw new Error("ACTUALIZACION_NO_CONFIRMADA");
            onTicketUpdated?.();
            onClose();
        } catch (err) {
            setActionError(
                "No se pudo actualizar el ticket. Conservamos la información para que reintentes.",
            );
            console.error("Error cancelando ticket:", err);
        }
    };

    const handleOnTicketProcess = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        setActionError("");
        try {
            const updated = await updateTicket(ticketId, { estadoId: 3 });
            if (!updated) throw new Error("ACTUALIZACION_NO_CONFIRMADA"); // En trabajo
            onTicketUpdated?.();
            onClose();
        } catch (err) {
            setActionError(
                "No se pudo actualizar el ticket. Conservamos la información para que reintentes.",
            );
            console.error("Error poniendo ticket en proceso:", err);
        }
    };

    const handleOnTicketFinish = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        setActionError("");
        try {
            const updated = await updateTicket(ticketId, { estadoId: 5 });
            if (!updated) throw new Error("ACTUALIZACION_NO_CONFIRMADA"); // Completado
            onTicketUpdated?.();
            onClose();
        } catch (err) {
            setActionError(
                "No se pudo actualizar el ticket. Conservamos la información para que reintentes.",
            );
            console.error("Error finalizando ticket:", err);
        }
    };

    const ticketState = ticketData?.estadoNombre.toLowerCase();
    const canCancel =
        ticketState &&
        !["asignado", "completado", "resuelto", "cancelado"].includes(ticketState);
    const canStart = ["creado", "sin asignar", "asignado"].includes(ticketState || "");

    const state = ticketState?.replaceAll(" ", "_") as ChipState | undefined;
    const tabs = [
        { id: "conversacion", label: "Conversación" },
        { id: "historial", label: "Historial" },
        { id: "archivos", label: "Archivos" },
    ];
    const files = (
        <>
            {isTicketAttachmentsLoading ? (
                <p role="status">Cargando archivos…</p>
            ) : attachmentsError ? (
                <div role="alert" className={styles.error}>
                    No se pudieron cargar los archivos.{" "}
                    <button onClick={() => void refetchAttachments()}>
                        Reintentar archivos
                    </button>
                </div>
            ) : ticketAttachments.length ? (
                <div className={styles.files}>
                    {ticketAttachments.map((file) => (
                        <File
                            key={file.id}
                            id={file.id}
                            name={file.nombreArchivo || "Archivo adjunto"}
                            onClick={() =>
                                setViewedFile({ id: file.id, name: file.nombreArchivo || "Archivo adjunto" })
                            }
                            variant="outlined"
                        />
                    ))}
                </div>
            ) : (
                <p className={styles.muted}>No hay archivos adjuntos.</p>
            )}
        </>
    );
    const content = (
        <div className={styles.ticketDetailContainer}>
            {presentation === "page" && (
                <nav className={styles.breadcrumb} aria-label="Ruta del ticket">
                    <Link href={returnHref}>Tickets</Link>
                    <span aria-hidden="true">/</span>
                    <span>{ticketData?.codigo || "#" + ticketId}</span>
                </nav>
            )}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    {presentation === "page" ? (
                        <h1>
                            {ticketData
                                ? `${ticketData.codigo} · ${ticketData.titulo}`
                                : `Ticket #${ticketId}`}
                        </h1>
                    ) : (
                        <h2>
                            {ticketData
                                ? `${ticketData.codigo} · ${ticketData.titulo}`
                                : `Ticket #${ticketId}`}
                        </h2>
                    )}
                    <p className={styles.muted}>
                        {ticketData?.categoriaNombre ||
                            "Detalle de la solicitud"}
                    </p>
                </div>
                <div className={styles.headerActions}>
                    {ticketData && (
                        <TicketStateChip
                            state={state}
                            label={ticketData.estadoNombre}
                        />
                    )}
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        aria-label={
                            presentation === "page"
                                ? "Volver al listado de tickets"
                                : "Cerrar detalle del ticket"
                        }
                    >
                        {presentation === "page"
                            ? "Volver al listado"
                            : "Cerrar"}
                    </Button>
                </div>
            </header>
            {viewedFile && <FileViewer key={viewedFile.id} ticketId={ticketId} file={viewedFile} onClose={() => setViewedFile(null)} />}
            {actionError && (
                <p className={styles.error} role="alert">
                    {actionError}
                </p>
            )}
            {isTicketLoading && !ticketData ? (
                <div role="status" className={styles.card}>
                    Cargando detalles del ticket…
                </div>
            ) : ticketError ? (
                <div role="alert" className={styles.error}>
                    No fue posible consultar este ticket.{" "}
                    <button onClick={() => void refetchTicket()}>
                        Reintentar ticket
                    </button>
                </div>
            ) : !ticketData ? (
                <div className={styles.card}>
                    No se encontraron detalles para este ticket.
                </div>
            ) : (
                <div className={styles.content}>
                    <section
                        className={styles.mainPanel}
                        aria-label="Seguimiento del ticket"
                    >
                        <div
                            className={styles.tabs}
                            role="tablist"
                            aria-label="Vistas del ticket"
                        >
                            {tabs.map((item, index) => (
                                <button
                                    key={item.id}
                                    id={tabsId + "-" + item.id}
                                    role="tab"
                                    aria-selected={tab === item.id}
                                    aria-controls={tabsId + "-panel-" + item.id}
                                    tabIndex={tab === item.id ? 0 : -1}
                                    onClick={() => setTab(item.id)}
                                    onKeyDown={(event) => {
                                        const next =
                                            event.key === "ArrowRight"
                                                ? (index + 1) % tabs.length
                                                : event.key === "ArrowLeft"
                                                    ? (index + tabs.length - 1) %
                                                    tabs.length
                                                    : event.key === "Home"
                                                        ? 0
                                                        : event.key === "End"
                                                            ? tabs.length - 1
                                                            : -1;
                                        if (next < 0) return;
                                        event.preventDefault();
                                        setTab(tabs[next].id);
                                        document
                                            .getElementById(
                                                tabsId + "-" + tabs[next].id,
                                            )
                                            ?.focus();
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        <div
                            id={tabsId + "-panel-conversacion"}
                            role="tabpanel"
                            aria-labelledby={tabsId + "-conversacion"}
                            hidden={tab !== "conversacion"}
                        >
                            <div className={styles.description}>
                                <h3>Descripción de la solicitud</h3>
                                <MarkdownViewer
                                    content={ticketData.descripcion}
                                />
                            </div>
                            <Chat ticketId={ticketId} classname={styles.chat} onOpenFile={setViewedFile} />
                        </div>
                        <div
                            id={tabsId + "-panel-historial"}
                            role="tabpanel"
                            aria-labelledby={tabsId + "-historial"}
                            hidden={tab !== "historial"}
                        >
                            <HistoryMessage
                                ticketId={ticketId}
                                variant="table"
                                actorNames={{
                                    [ticketData.usuarioCreadorId]:
                                        ticketData.creador?.nombre ||
                                        ticketData.usuarioCreadorNombre,
                                    ...(ticketData.asignado && ticketData.usuarioAsignadoId
                                        ? {
                                            [ticketData.usuarioAsignadoId]:
                                                  ticketData.asignado.nombre,
                                        }
                                        : {}),
                                }}
                            />
                        </div>
                        <div
                            id={tabsId + "-panel-archivos"}
                            role="tabpanel"
                            aria-labelledby={tabsId + "-archivos"}
                            hidden={tab !== "archivos"}
                            className={styles.filesPanel}
                        >
                            <h3>Archivos del ticket</h3>
                            {files}
                        </div>
                    </section>
                    <aside
                        className={styles.sidebar}
                        aria-label="Información del ticket"
                    >
                        <section className={styles.card}>
                            <h2>Información del ticket</h2>
                            <dl className={styles.metadata}>
                                <div>
                                    <dt>Estado</dt>
                                    <dd>{ticketData.estadoNombre}</dd>
                                </div>
                                <div>
                                    <dt>Asignado a</dt>
                                    <dd>
                                        {ticketData.asignado?.nombre ||
                                            ticketData.usuarioAsignadoNombre ||
                                            "Sin asignar"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Creado por</dt>
                                    <dd>
                                        {ticketData.creador?.nombre ||
                                            ticketData.usuarioCreadorNombre}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Prioridad</dt>
                                    <dd>{ticketData.prioridadNombre}</dd>
                                </div>
                            </dl>
                            <p className={styles.created}>
                                Creado: {displayDate(ticketData.fechaCreacion)}
                            </p>
                        </section>
                        <section
                            className={styles.card}
                            aria-label="Adjuntos del ticket"
                        >
                            <h2>Archivos</h2>
                            {files}
                        </section>
                        {role !== "USUARIO" && (
                            <section className={styles.card}>
                                <h2>Gestión del ticket</h2>
                                {isTagsLoading ? (
                                    <p role="status">Cargando etiquetas…</p>
                                ) : (
                                    <LabelChipGroup
                                        role={role}
                                        labels={labels}
                                        availableOptions={availableOptions}
                                        onChange={handleLabelsChange}
                                    />
                                )}
                                <div className={styles.ticketActions}>
                                    {canCancel && (
                                        <Button
                                            color="danger"
                                            onClick={handleOnTicketCancel}
                                            fullWidth
                                            state={
                                                isUpdating
                                                    ? "loading"
                                                    : "default"
                                            }
                                        >
                                            Cancelar ticket
                                        </Button>
                                    )}
                                    {canStart ? (
                                        <Button
                                            onClick={handleOnTicketProcess}
                                            fullWidth
                                            state={
                                                isUpdating
                                                    ? "loading"
                                                    : "default"
                                            }
                                        >
                                            Iniciar atención
                                        </Button>
                                    ) : ["en trabajo", "en atención"].includes(ticketState || "") ? (
                                        <Button
                                            onClick={handleOnTicketFinish}
                                            fullWidth
                                            state={
                                                isUpdating
                                                    ? "loading"
                                                    : "default"
                                            }
                                        >
                                            Resolver ticket
                                        </Button>
                                    ) : (
                                        <p className={styles.muted}>
                                            No hay acciones disponibles para
                                            este estado.
                                        </p>
                                    )}
                                </div>
                            </section>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
    return presentation === "page" ? (
        content
    ) : (
        <PopOver
            isOpen={isOpen}
            onClose={onClose}
            position="center"
            className={styles.popOver}
        >
            {content}
        </PopOver>
    );
};

const TicketDetail: React.FC<TicketDetailProps> = (props) =>
    props.isOpen && props.ticketId ? <TicketDetailContent {...props} /> : null;

export default TicketDetail;
