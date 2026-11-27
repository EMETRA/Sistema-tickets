import React, { useId, useState } from "react";
import Link from "next/link";
import { TicketStateChip } from "@/components/client/atoms/TicketStateChip";
import type { ChipState } from "@/components/client/atoms/TicketStateChip/types";
import { displayDate } from "@/helpers/displayDate";
import { FileViewer, type ViewedFile } from "@/components/client/organisms/FileViewer/FileViewer";

import { PopOver } from "@/components/client/atoms/PopOver";
import { File } from "@/components/client/atoms/File";
import { Button } from "@/components/client/atoms/Button";

import { Chat } from "@/features/tickets/components/Chat";
import { HistoryMessage } from "@/components/client/molecules/HistoryMessage";

import { useAuthStore } from "@/store/useAuthStore";

import { useGetTicketById, useGetTicketTagCatalog, useUpdateTicket } from "@/api/hooks";
import { useGetTicketAttachments } from "@/api/hooks";

import styles from "./TicketDetail.module.scss";
import { TicketDetailProps } from "./types";
import { MarkdownViewer } from "@/components/client/atoms/MarkdownViewer";
import { TicketClassification } from "./TicketClassification";
import { usePlatform } from "@/platform/context";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";

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
    const { data: platform } = usePlatform();
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
        data: tagCatalog,
        error: catalogError,
        loading: catalogLoading,
        refetch: refetchCatalog,
    } = useGetTicketTagCatalog();
    const [tagCount, setTagCount] = useState<number | null>(null),
        [tagDirty, setTagDirty] = useState(false),
        [tagBusy, setTagBusy] = useState(false),
        [historyRevision, setHistoryRevision] = useState(0);

    const handleOnTicketCancel = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

    const handleOnTicketProcess = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

    const handleOnTicketFinish = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

    const code = ticketData?.codigo?.trim();
    const ticketCode = code && !/^(null|undefined)$/i.test(code) ? code : "#" + ticketId;
    const ticketState = ticketData?.estadoNombre?.toLowerCase();
    const stateId = Number(ticketData?.estadoId);
    const canAttend = platform
        ? platform.actor.admin ||
          (platform.capabilities.attend && Number(ticketData?.usuarioAsignadoId) === platform.actor.id)
        : role !== "USUARIO";
    const canManageTags = Boolean(
        platform && [2, 3].includes(stateId) && ticketData?.usuarioAsignadoId && canAttend,
    );
    const canCancel =
        [1, 2, 3].includes(stateId) &&
        (platform
            ? platform.actor.admin ||
              (Number(ticketData?.usuarioCreadorId) === platform.actor.id && !ticketData?.usuarioAsignadoId)
            : !["asignado"].includes(ticketState || ""));
    const canStart = stateId === 2 && canAttend;
    const canResolve = stateId === 3 && canAttend;

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
                    <button onClick={() => void refetchAttachments()}>Reintentar archivos</button>
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
    // Propuesta: acciones del ticket fijas al pie, con la misma lógica de etiquetas.
    const needsTags = canResolve && (tagCount === null || tagCount === 0 || tagDirty);
    const actions = (canStart || canResolve || canCancel) && (
        <>
            {canCancel && (
                <Button
                    color="danger"
                    variant="outlined"
                    onClick={handleOnTicketCancel}
                    state={isUpdating ? "loading" : "default"}
                >
                    Cancelar ticket
                </Button>
            )}
            {canStart && (
                <Button
                    onClick={handleOnTicketProcess}
                    state={isUpdating ? "loading" : tagDirty || tagBusy ? "disabled" : "default"}
                >
                    Iniciar atención
                </Button>
            )}
            {canResolve && (
                <Button
                    onClick={handleOnTicketFinish}
                    state={isUpdating ? "loading" : needsTags || tagBusy ? "disabled" : "default"}
                >
                    Resolver ticket
                </Button>
            )}
        </>
    );
    const content = (
        <div className={`${styles.ticketDetailContainer} ${styles.sheet}`}>
            {presentation === "page" && (
                <nav className={styles.breadcrumb} aria-label="Ruta del ticket">
                    <Link href={returnHref}>Tickets</Link>
                    <span aria-hidden="true">/</span>
                    <span>{ticketCode}</span>
                </nav>
            )}
            <header className={styles.sheetHead}>
                <span className={styles.sheetIcon} aria-hidden="true">
                    <WorkspaceIcon name="ticket-solid" size={20} />
                </span>
                <div className={styles.sheetTitles}>
                    <div className={styles.sheetKind}>
                        Ticket
                        {ticketData?.categoriaNombre ? ` · ${ticketData.categoriaNombre}` : ""}
                        {ticketData && <TicketStateChip state={state} label={ticketData.estadoNombre} />}
                    </div>
                    {presentation === "page" ? (
                        <h1>{ticketData ? ticketData.titulo : `Ticket #${ticketId}`}</h1>
                    ) : (
                        <h2>{ticketData ? `${ticketCode} · ${ticketData.titulo}` : `Ticket #${ticketId}`}</h2>
                    )}
                    {ticketData && (
                        <p className={styles.sheetSub}>
                            Solicitado por {ticketData.creador?.nombre || ticketData.usuarioCreadorNombre} ·{" "}
                            {displayDate(ticketData.fechaCreacion)}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    className={styles.sheetClose}
                    onClick={onClose}
                    aria-label={
                        presentation === "page" ? "Volver al listado de tickets" : "Cerrar detalle del ticket"
                    }
                >
                    ×
                </button>
            </header>
            {viewedFile && (
                <FileViewer
                    key={viewedFile.id}
                    ticketId={ticketId}
                    file={viewedFile}
                    onClose={() => setViewedFile(null)}
                />
            )}
            {actionError && (
                <p className={styles.error} role="alert">
                    {actionError} <button onClick={() => void refetchTicket()}>Actualizar detalle</button>
                </p>
            )}
            {isTicketLoading && !ticketData ? (
                <div role="status" className={styles.card}>
                    Cargando detalles del ticket…
                </div>
            ) : ticketError ? (
                <div role="alert" className={styles.error}>
                    No fue posible consultar este ticket.{" "}
                    <button onClick={() => void refetchTicket()}>Reintentar ticket</button>
                </div>
            ) : !ticketData ? (
                <div className={styles.card}>No se encontraron detalles para este ticket.</div>
            ) : (
                <div className={styles.content}>
                    <section className={styles.mainPanel} aria-label="Seguimiento del ticket">
                        <div className={styles.tabs} role="tablist" aria-label="Vistas del ticket">
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
                                                  ? (index + tabs.length - 1) % tabs.length
                                                  : event.key === "Home"
                                                    ? 0
                                                    : event.key === "End"
                                                      ? tabs.length - 1
                                                      : -1;
                                        if (next < 0) return;
                                        event.preventDefault();
                                        setTab(tabs[next].id);
                                        document.getElementById(tabsId + "-" + tabs[next].id)?.focus();
                                    }}
                                >
                                    {item.label}
                                    {item.id === "archivos" && ticketAttachments.length > 0 && (
                                        <span className={styles.tabCount}>{ticketAttachments.length}</span>
                                    )}
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
                                <MarkdownViewer content={ticketData.descripcion} />
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
                                key={historyRevision}
                                ticketId={ticketId}
                                variant="table"
                                actorNames={{
                                    [ticketData.usuarioCreadorId]:
                                        ticketData.creador?.nombre || ticketData.usuarioCreadorNombre,
                                    ...(ticketData.asignado && ticketData.usuarioAsignadoId
                                        ? {
                                              [ticketData.usuarioAsignadoId]: ticketData.asignado.nombre,
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
                    {
                        <aside className={styles.sidePanel} aria-label="Información del ticket">
                            <dl className={styles.sideFacts}>
                                <div>
                                    <dt>Asignado a</dt>
                                    <dd>
                                        {ticketData.asignado?.nombre ||
                                            ticketData.usuarioAsignadoNombre ||
                                            "Sin asignar"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Prioridad</dt>
                                    <dd>{ticketData.prioridadNombre || "—"}</dd>
                                </div>
                                <div>
                                    <dt>Creado por</dt>
                                    <dd>{ticketData.creador?.nombre || ticketData.usuarioCreadorNombre}</dd>
                                </div>
                                <div>
                                    <dt>Creado</dt>
                                    <dd>{displayDate(ticketData.fechaCreacion)}</dd>
                                </div>
                            </dl>
                            <section className={styles.sideSection} aria-label="Clasificación del trabajo">
                                <h3>Clasificación del trabajo</h3>
                                {catalogLoading && <p role="status">Cargando catálogo de etiquetas…</p>}
                                {catalogError && (
                                    <div role="alert">
                                        <p>No se pudo cargar el catálogo de etiquetas.</p>
                                        <Button variant="outlined" onClick={() => void refetchCatalog()}>
                                            Reintentar catálogo
                                        </Button>
                                    </div>
                                )}
                                <TicketClassification
                                    catalogReady={!catalogLoading && !catalogError}
                                    onCatalogChanged={refetchCatalog}
                                    ticketId={ticketId}
                                    catalog={tagCatalog}
                                    editable={canManageTags && !catalogError && !catalogLoading}
                                    admin={Boolean(platform?.actor.admin)}
                                    onDirtyChange={setTagDirty}
                                    onBusyChange={setTagBusy}
                                    onCountChange={setTagCount}
                                    onSaved={async () => {
                                        setActionError("");
                                        setHistoryRevision((value) => value + 1);
                                    }}
                                />
                            </section>
                        </aside>
                    }
                </div>
            )}
            {ticketData && (actions || needsTags) && (
                <footer className={styles.sheetFoot}>
                    <p>
                        {needsTags
                            ? "Guarda al menos una etiqueta de trabajo antes de resolver el ticket."
                            : "Los cambios de estado quedan en el historial del ticket."}
                    </p>
                    <div className={styles.sheetActions}>{actions}</div>
                </footer>
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
            className={`${styles.popOver} ${styles.popOverProposal}`}
        >
            {content}
        </PopOver>
    );
};

const TicketDetail: React.FC<TicketDetailProps> = (props) =>
    props.isOpen && props.ticketId ? <TicketDetailContent key={props.ticketId} {...props} /> : null;

export default TicketDetail;
