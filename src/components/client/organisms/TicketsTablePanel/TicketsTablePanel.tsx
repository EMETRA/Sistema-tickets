"use client";
import React, { useId, useMemo, useState } from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { ModalContent } from "../../molecules/ModalContent";
import { InlineAlert } from "../../molecules/InlineAlert";
import { TicketStateChip } from "../../atoms/TicketStateChip";
import { AssignedChip } from "../../molecules/AssignedChip";
import ModalUserSelect from "@/components/client/molecules/ModalUserSelect";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import { useAuthStore } from "@/store/useAuthStore";
import type { TicketsTablePanelProps } from "./types";
import styles from "./TicketsTablePanel.module.scss";

export const TicketsTablePanel: React.FC<TicketsTablePanelProps> = ({
    tickets,
    onDelete,
    onAssign,
    onExport,
    onRefresh,
    onOpenTicket,
    loading = false,
    className,
    onTicketUpdated,
}) => {
    const searchId = useId(), filtersId = useId();
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [query, setQuery] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [hiddenTicketIds, setHiddenTicketIds] = useState<
        Array<string | number>
    >([]);
    const [pendingCancellation, setPendingCancellation] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const [openAssignedChipModal, setOpenAssignedChipModal] = useState(false);
    const [ticketToAssign, setTicketToAssign] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [selectedTickedId, setSelectedTicketId] = useState<string | null>(
        null,
    );
    const role = useAuthStore((state) => state.getRole());
    const filteredTickets = useMemo(
        () =>
            tickets.filter((ticket) => {
                if (hiddenTicketIds.includes(ticket.id)) return false;
                if (selectedFilter === "asignado" && !ticket.assignedTo)
                    return false;
                if (selectedFilter === "sin_asignar" && ticket.assignedTo)
                    return false;
                if (
                    selectedStatus !== "all" &&
                    ticket.status.state !== selectedStatus
                )
                    return false;
                const text = [
                    ticket.code || ticket.id,
                    ticket.title,
                    ticket.user.name,
                    ticket.assignedTo?.name,
                ]
                    .join(" ")
                    .toLocaleLowerCase("es");
                return text.includes(query.trim().toLocaleLowerCase("es"));
            }),
        [tickets, hiddenTicketIds, selectedFilter, selectedStatus, query],
    );
    const pageCount = Math.max(1, Math.ceil(filteredTickets.length / 10));
    const currentPage = Math.min(page, pageCount - 1);
    const rows = filteredTickets.slice(
        currentPage * 10,
        (currentPage + 1) * 10,
    );
    const statuses = [
        ...new Map(
            tickets.map((ticket) => [ticket.status.state, ticket.status.label]),
        ).entries(),
    ];
    const openTicket = (id: string) =>
        onOpenTicket ? onOpenTicket(id) : setSelectedTicketId(id);
    // Manejar apertura del modal de eliminación
    const handleDeleteClick = (ticketId: string) => {
        if (pendingCancellation) {
            return;
        }

        setTicketToDelete(ticketId);
        setIsDeleteModalOpen(true);
    };

    // Confirmar cancelación y mostrar ventana para revertir
    const handleConfirmDelete = () => {
        if (ticketToDelete !== null) {
            const selectedTicket = tickets.find(
                (ticket) => ticket.id === ticketToDelete,
            );
            setHiddenTicketIds((prev) =>
                prev.includes(ticketToDelete)
                    ? prev
                    : [...prev, ticketToDelete],
            );
            setPendingCancellation({
                id: ticketToDelete,
                title: selectedTicket?.title || "Ticket",
            });
            setIsDeleteModalOpen(false);
            setTicketToDelete(null);
        }
    };

    // Cancelar eliminación
    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setTicketToDelete(null);
    };

    const handleUndoCancellation = () => {
        if (!pendingCancellation) {
            return;
        }

        setHiddenTicketIds((prev) =>
            prev.filter((id) => id !== pendingCancellation.id),
        );
        setPendingCancellation(null);
    };

    const handleFinalizeCancellation = async () => {
        if (!pendingCancellation) {
            return;
        }

        const ticketId = pendingCancellation.id;
        setPendingCancellation(null);

        if (!onDelete) {
            return;
        }

        try {
            await onDelete(ticketId);
        } catch (error) {
            console.error("Error cancelando ticket:", error);
            // En caso de error, devolver el ticket a la lista.
            setHiddenTicketIds((prev) => prev.filter((id) => id !== ticketId));
            return;
        }

        setHiddenTicketIds((prev) => prev.filter((id) => id !== ticketId));
    };

    const handleAssignClick = (ticketId: string) => {
        setTicketToAssign(ticketId);
        setOpenAssignedChipModal(true);
    };

    const handleAssignConfirm = async (selectedUserId: string) => {
        if (ticketToAssign === null) {
            setOpenAssignedChipModal(false);
            return;
        }

        if (!onAssign) {
            setOpenAssignedChipModal(false);
            setTicketToAssign(null);
            return;
        }

        try {
            setIsAssigning(true);
            await onAssign(ticketToAssign, selectedUserId);
        } catch (error) {
            console.error("Error asignando ticket:", error);
        } finally {
            setIsAssigning(false);
            setOpenAssignedChipModal(false);
            setTicketToAssign(null);
        }
    };

    return (
        <section
            className={classNames(styles.panel, className)}
            aria-label="Listado de tickets"
        >
            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <label htmlFor={searchId}>Buscar tickets</label>
                    <input
                        id={searchId}
                        type="search"
                        placeholder="Buscar por código, asunto o persona"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setPage(0);
                        }}
                    />
                </div>
                <div className={styles.controls}>
                    <Button
                        variant="outlined"
                        aria-expanded={filtersOpen}
                        aria-controls={filtersId}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        Filtros
                        {selectedFilter !== "all" || selectedStatus !== "all"
                            ? " · Activos"
                            : ""}
                    </Button>
                    {onRefresh && (
                        <Button
                            variant="outlined"
                            onClick={onRefresh}
                            state={loading ? "disabled" : "default"}
                        >
                            {loading ? "Actualizando…" : "Actualizar"}
                        </Button>
                    )}
                    {onExport && ["ADMINISTRADOR", "TECNICO", "DESARROLLADOR"].includes(role || "") && (
                        <Button
                            variant="outlined"
                            onClick={onExport}
                            state={loading ? "disabled" : "default"}
                        >
                            Exportar
                        </Button>
                    )}
                </div>
            </div>
            {filtersOpen && (
                <div id={filtersId} className={styles.filters}>
                    <label>
                        Estado
                        <select
                            aria-label="Estado"
                            value={selectedStatus}
                            onChange={(event) => {
                                setSelectedStatus(event.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="all">Todos los estados</option>
                            {statuses.map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Asignación
                        <select
                            aria-label="Asignación"
                            value={selectedFilter}
                            onChange={(event) => {
                                setSelectedFilter(event.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="all">Todas las asignaciones</option>
                            <option value="asignado">Asignados</option>
                            <option value="sin_asignar">Sin asignar</option>
                        </select>
                    </label>
                    <button
                        className={styles.link}
                        onClick={() => {
                            setSelectedStatus("all");
                            setSelectedFilter("all");
                            setQuery("");
                            setPage(0);
                        }}
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}
            {loading && (
                <p role="status" className={styles.notice}>
                    Cargando tickets…
                </p>
            )}
            <div className={styles.tableRegion}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Asunto</th>
                            <th>Creado por</th>
                            <th>Estado</th>
                            <th>Asignado a</th>
                            <th>Fecha</th>
                            <th>
                                <span className={styles.srOnly}>Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((ticket) => (
                            <tr key={ticket.id}>
                                <td>
                                    <button
                                        className={styles.code}
                                        onClick={() => openTicket(ticket.id)}
                                        aria-label={
                                            "Abrir ticket " +
                                            (ticket.code || ticket.id)
                                        }
                                    >
                                        {ticket.code || "#" + ticket.id}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className={styles.subject}
                                        onClick={() => openTicket(ticket.id)}
                                        aria-label={
                                            "Ver detalle de " + ticket.title
                                        }
                                    >
                                        {ticket.title}
                                    </button>
                                </td>
                                <td>
                                    {ticket.user.name}
                                    {ticket.user.department && (
                                        <small>{ticket.user.department}</small>
                                    )}
                                </td>
                                <td>
                                    <TicketStateChip
                                        label={ticket.status.label}
                                        state={ticket.status.state}
                                    />
                                </td>
                                <td>
                                    {role === "ADMINISTRADOR" && onAssign ? (
                                        <AssignedChip
                                            assigned={!!ticket.assignedTo}
                                            userName={ticket.assignedTo?.name}
                                            avatarSrc={
                                                ticket.assignedTo?.avatarSrc
                                            }
                                            avatarInitials={
                                                ticket.assignedTo?.initials
                                            }
                                            onClick={() => {
                                                if (!isAssigning)
                                                    handleAssignClick(
                                                        ticket.id,
                                                    );
                                            }}
                                        />
                                    ) : (
                                        ticket.assignedTo?.name || "Sin asignar"
                                    )}
                                </td>
                                <td className={styles.date}>{ticket.date}</td>
                                <td>
                                    {onDelete &&
                                        (role === "ADMINISTRADOR" ||
                                            (role === "USUARIO" &&
                                                !ticket.assignedTo)) &&
                                        !["cancelado", "completado", "resuelto"].includes(
                                            ticket.status.state,
                                        ) && (
                                        <button
                                            className={styles.cancel}
                                            aria-label={
                                                "Cancelar ticket " +
                                                    ticket.title
                                            }
                                            disabled={
                                                !!pendingCancellation ||
                                                    isAssigning
                                            }
                                            onClick={() =>
                                                handleDeleteClick(ticket.id)
                                            }
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && !rows.length && (
                <div className={styles.empty}>
                    <strong>
                        {tickets.length
                            ? "No hay coincidencias"
                            : "Todavía no hay tickets"}
                    </strong>
                    <p>
                        {tickets.length
                            ? "Prueba otro término o limpia los filtros."
                            : "Las solicitudes aparecerán aquí cuando registres un ticket."}
                    </p>
                </div>
            )}
            <footer className={styles.footer}>
                <span>
                    {filteredTickets.length}{" "}
                    {filteredTickets.length === 1 ? "registro" : "registros"}
                </span>
                <nav aria-label="Paginación de tickets">
                    <button
                        disabled={currentPage === 0}
                        onClick={() => setPage(currentPage - 1)}
                    >
                        Anterior
                    </button>
                    <span aria-current="page">
                        {currentPage + 1} de {pageCount}
                    </span>
                    <button
                        disabled={currentPage >= pageCount - 1}
                        onClick={() => setPage(currentPage + 1)}
                    >
                        Siguiente
                    </button>
                </nav>
            </footer>
            <ModalContent
                isOpen={isDeleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Cancelar ticket"
                description="El ticket se conservará en el historial de cancelados."
                confirmLabel="Confirmar"
                cancelLabel="Volver"
            />
            <InlineAlert
                isOpen={!!pendingCancellation}
                onClose={handleFinalizeCancellation}
                onAction={handleUndoCancellation}
                title="Revertir cancelación"
                description="Puedes revertirla antes de que termine la espera."
                actionLabel="Revertir"
                duration={6}
            />
            <ModalUserSelect
                isOpen={openAssignedChipModal}
                onClose={() => {
                    setOpenAssignedChipModal(false);
                    setTicketToAssign(null);
                }}
                onConfirm={handleAssignConfirm}
            />
            <TicketDetail
                isOpen={!!selectedTickedId}
                onClose={() => setSelectedTicketId(null)}
                ticketId={selectedTickedId || ""}
                onTicketUpdated={onTicketUpdated}
            />
        </section>
    );
};
export default TicketsTablePanel;
