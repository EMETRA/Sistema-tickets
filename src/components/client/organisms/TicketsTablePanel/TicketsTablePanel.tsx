"use client";

import React, { useState, useMemo } from "react";
import classNames from "classnames";
import { TableRow } from "../../molecules/TableRow";
import { TicketsFilterBar } from "../TicketsFilterBar";
import { ModalContent } from "../../molecules/ModalContent";
import { InlineAlert } from "../../molecules/InlineAlert";
import { Avatar } from "../../atoms/Avatar";
import { Text } from "../../atoms/Text";
import { Chip } from "../../atoms/Chip";
import { AssignedChip } from "../../molecules/AssignedChip";
import { IconButton } from "../../atoms/IconButton";
import ModalUserSelect from "@/components/client/molecules/ModalUserSelect";
import type { TicketsTablePanelProps, Ticket } from "./types";
import styles from "./TicketsTablePanel.module.scss";

// Constantes
const COMMON_GRID = "minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 0.6fr) minmax(0, 0.9fr) minmax(0, 1.2fr) minmax(0, 1fr)";

const FILTER_OPTIONS = [
  { label: "Asignados", value: "assigned", icon: "user-tag-solid" as const },
  { label: "Cancelados", value: "cancelled", icon: "xmark-solid" as const },
];

/**
 * Componente TicketsTablePanel - Tabla completa de tickets con filtros y acciones
 *
 * @param {TicketsTablePanelProps} props - Las propiedades del componente
 * @returns {JSX.Element} El componente TicketsTablePanel renderizado
 */
export const TicketsTablePanel: React.FC<TicketsTablePanelProps> = ({
  tickets,
  onDelete,
  onAssign,
  onExport,
  loading = false,
  className,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedMemberId, setSelectedMemberId] = useState<string | number | undefined>();
  const [ticketToDelete, setTicketToDelete] = useState<string | number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hiddenTicketIds, setHiddenTicketIds] = useState<Array<string | number>>([]);
  const [pendingCancellation, setPendingCancellation] = useState<{ id: string | number; title: string } | null>(null);
  const [openAssignedChipModal, setOpenAssignedChipModal] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState<string | number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const visibleTickets = useMemo(() => (
    tickets.filter((ticket) => !hiddenTicketIds.includes(ticket.id))
  ), [tickets, hiddenTicketIds]);

  // Extraer miembros únicos de los tickets para el filtro
  const members = useMemo(() => {
    const uniqueUsers = new Map();
    
    visibleTickets.forEach(ticket => {
      if (!uniqueUsers.has(ticket.user.id)) {
        uniqueUsers.set(ticket.user.id, {
          id: ticket.user.id,
          name: ticket.user.name,
          initials: ticket.user.initials,
          avatarSrc: ticket.user.avatarSrc,
        });
      }
      
      if (ticket.assignedTo && !uniqueUsers.has(ticket.assignedTo.id)) {
        uniqueUsers.set(ticket.assignedTo.id, {
          id: ticket.assignedTo.id,
          name: ticket.assignedTo.name,
          initials: ticket.assignedTo.initials,
          avatarSrc: ticket.assignedTo.avatarSrc,
        });
      }
    });
    
    return Array.from(uniqueUsers.values());
  }, [visibleTickets]);

  // Filtrar tickets según el filtro seleccionado y el miembro seleccionado
  const filteredTickets = useMemo(() => {
    let filtered = visibleTickets;

    // Filtrar por tipo (Asignados/Cancelados)
    if (selectedFilter === "assigned") {
      filtered = filtered.filter(ticket => ticket.assignedTo !== null && ticket.assignedTo !== undefined);
    } else if (selectedFilter === "cancelled") {
      filtered = filtered.filter(ticket => ticket.status.state === "canceled");
    }

    // Filtrar por miembro seleccionado
    if (selectedMemberId) {
      filtered = filtered.filter(ticket => 
        ticket.user.id === selectedMemberId || 
        ticket.assignedTo?.id === selectedMemberId
      );
    }

    return filtered;
  }, [visibleTickets, selectedFilter, selectedMemberId]);

  // Manejar apertura del modal de eliminación
  const handleDeleteClick = (ticketId: string | number) => {
    if (pendingCancellation) {
      return;
    }

    setTicketToDelete(ticketId);
    setIsDeleteModalOpen(true);
  };

  // Confirmar cancelación y mostrar ventana para revertir
  const handleConfirmDelete = () => {
    if (ticketToDelete !== null) {
      const selectedTicket = tickets.find((ticket) => ticket.id === ticketToDelete);
      setHiddenTicketIds((prev) => (prev.includes(ticketToDelete) ? prev : [...prev, ticketToDelete]));
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

    setHiddenTicketIds((prev) => prev.filter((id) => id !== pendingCancellation.id));
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

  const handleAssignClick = (ticketId: string | number) => {
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

  // Renderizar una fila de ticket
  const renderTicketRow = (ticket: Ticket) => {
    return (
      <TableRow
        key={ticket.id}
        gridTemplate={COMMON_GRID}
        scale={0.8}
        cells={[
          {
            content: (
              <div className={styles.userMenu}>
                <Avatar
                  initials={ticket.user.initials}
                  src={ticket.user.avatarSrc}
                  size="sm"
                />
                <div className={styles.info}>
                  <Text variant="body" className={styles.name}>
                    {ticket.user.name}
                  </Text>
                  <Text variant="caption" className={styles.role}>
                    {ticket.user.department}
                  </Text>
                </div>
              </div>
            ),
          },
          { content: <Text variant="muted">{ticket.title}</Text> },
          { content: <Text variant="muted">{ticket.description}</Text> },
          { content: <Text variant="muted">{ticket.date}</Text> },
          {
            content: <Chip label={ticket.status.label} state={ticket.status.state} />,
            align: "center",
          },
          {
            content: (
              <AssignedChip
                assigned={!!ticket.assignedTo}
                userName={ticket.assignedTo?.name}
                avatarSrc={ticket.assignedTo?.avatarSrc}
                avatarInitials={ticket.assignedTo?.initials}
                onClick={() => {
                  if (!isAssigning) {
                    handleAssignClick(ticket.id);
                  }
                }}
              />
            ),
            align: "center",
          },
          {
            content: (
              <IconButton
                icon="trash-solid"
                size={24}
                iconColor="#BDBDBD"
                disabled={!!pendingCancellation || isAssigning}
                onClick={() => handleDeleteClick(ticket.id)}
              />
            ),
            align: "center",
          },
        ]}
      />
    );
  };

  return (
    <div className={classNames(styles.TicketsTablePanel, className)}>
      {/* Barra de filtros */}
      <TicketsFilterBar
        filterOptions={FILTER_OPTIONS}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        onExport={onExport || (() => {})}
        members={members}
        selectedMemberId={selectedMemberId}
        onMemberSelect={(member) => setSelectedMemberId(member?.id)}
        disabled={loading}
      />

      {/* Tabla de tickets */}
      <div className={styles.tableContainer}>
        {/* Header */}
        <TableRow
          isHeader
          gridTemplate={COMMON_GRID}
          cells={[
            { icon: "user-regular", label: "Usuario" },
            { icon: "clipboard-regular", label: "Titulo" },
            { icon: "file-lines-regular", label: "Descripción" },
            { icon: "calendar-regular", label: "Fecha" },
            { icon: "magnifying-glass-solid", label: "Status Actual" },
            { icon: "circle-user-regular", label: "Asignación" },
            { icon: "hand-regular", label: "Acciones" },
          ]}
        />

        {/* Filas de datos */}
        {loading ? (
          <div className={styles.loadingState}>
            <Text variant="muted">Cargando tickets...</Text>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <Text variant="muted">No hay tickets para mostrar</Text>
          </div>
        ) : (
          filteredTickets.map(renderTicketRow)
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <ModalContent
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Cancelar"
        description="Estas seguro de cancelar este ticket, este ticket lo encontraras en el apartado de cancelados"
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
      />

      <InlineAlert
        isOpen={!!pendingCancellation}
        onClose={handleFinalizeCancellation}
        onAction={handleUndoCancellation}
        title="Revertir cancelacion"
        description={`Cierra la alerta si no quieres revertirlo o espera a que se cierre.`}
        actionLabel="Revertir"
        duration={6}
      />

      {/* Modal para asignación de usuario a un ticket sin asignación */}
      <ModalUserSelect
        isOpen={openAssignedChipModal}
        onClose={() => {
          setOpenAssignedChipModal(false);
          setTicketToAssign(null);
        }}
        onConfirm={handleAssignConfirm}
      />
    </div>
  );
};

export default TicketsTablePanel;
