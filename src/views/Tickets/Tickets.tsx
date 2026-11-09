"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TicketsTablePanel } from "@/components/client/organisms/TicketsTablePanel";
import { Ticket } from "@/components/client/organisms/TicketsTablePanel/types";
import {
    useTicketsByRole,
    useUpdateTicket,
} from "@/api/hooks";
import styles from "./Tickets.module.scss";

import { ErrorHandler } from "@/api/graphql/errors";

import type { ChipState } from "@/components/client/atoms/TicketStateChip/types";

const Tickets = ({ scope = "role" }: { scope?: "role" | "created" }) => {
    const router = useRouter();
    // Hook que obtiene tickets filtrados automáticamente según el rol del usuario
    const {
        data: ticketsData,
        loading: isLoading,
        error: loadError,
        refetch: refetchTickets,
    } = useTicketsByRole(undefined, scope);
    const { updateTicket, loading: isUpdating } = useUpdateTicket();
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState("");

    // Auto-ejecutar refetch al montar el componente (solo una vez)

    const hasRunOnce = useRef(false);

    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetchTickets();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCancelTicket = async (ticketId: string) => {
        setActionMessage("");
        setActionError("");
        try {
            const updated = await updateTicket(ticketId, { estadoId: 4 });
            if (!updated) throw new Error("No se pudo cancelar el ticket.");
            setActionMessage("Ticket cancelado. Su historial se conserva.");
            await refetchTickets();
        } catch (err) {
            setActionError(ErrorHandler.getUserMessage(err));
        }
    };

    const handleAssignTicket = async (
        ticketId: string,
        userId: string | number,
    ) => {
        setActionMessage("");
        setActionError("");
        try {
            // 1. Normalizamos los IDs
            const tId = ticketId.toString();
            // El backend espera un Int para el ID de usuario según el README
            const uId = typeof userId === "string" ? parseInt(userId, 10) : userId;

            if (!Number.isSafeInteger(uId) || uId <= 0) {
                setActionError("Selecciona un responsable válido.");
                return;
            }
            const response = await updateTicket(tId, {
                usuarioAsignadoId: uId,
                estadoId: 2,
            });

            if (response) {
                setActionMessage("Ticket asignado correctamente.");
                await refetchTickets?.();
            }
        } catch (err) {
            setActionError(ErrorHandler.getUserMessage(err));
        }
    };

    // Derivar estados
    const error = loadError
        ? "No fue posible cargar los tickets. Intenta nuevamente."
        : "";

    // Función para formatear fecha
    // Si es hoy, retorna solo la hora; si no, retorna fecha y hora
    const formatTicketDate = (dateString: string): string => {
        const ticketDate = new Date(dateString);
        const today = new Date();

        const isToday =
      ticketDate.getDate() === today.getDate() &&
      ticketDate.getMonth() === today.getMonth() &&
      ticketDate.getFullYear() === today.getFullYear();

        if (isToday) {
            // Mostrar solo la hora
            return ticketDate.toLocaleTimeString("es-GT", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            // Mostrar fecha y hora
            return ticketDate.toLocaleString("es-GT", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    };

    // Mapear tickets del API al tipo esperado por TicketsTablePanel
    const transformedTickets: Ticket[] =
    ticketsData?.map((ticket) => {
        return {
            id: ticket.id,
            code: ticket.codigo,
            user: {
                id: ticket.usuarioCreadorId,
                name: ticket.creador.nombre,
                email: "",
                department: ticket.creador.department || "Sin departamento",
                initials:
            ticket.creador.nombre.charAt(0) +
            (ticket.creador.nombre.split(" ")[1]?.charAt(0) || ""),
                avatar: ticket.creador.avatar,
            },
            title: ticket.titulo,
            description: ticket.descripcion,
            date: formatTicketDate(ticket.fechaCreacion),
            status: {
                label: ticket.estadoNombre,
                state: ticket.estadoNombre.toLowerCase().replaceAll(" ", "_") as ChipState,
            },
            assignedTo: ticket.asignado
                ? {
                    id: ticket.asignado.id,
                    name: ticket.asignado.nombre,
                    initials:
                ticket.asignado.nombre.charAt(0) +
                (ticket.asignado.nombre.split(" ")[1]?.charAt(0) || ""),
                    avatarSrc: ticket.asignado.avatar || undefined,
                }
                : null,
        };
    }) || [];

    const handleExportTickets = () => {
        if (!transformedTickets.length) return;

        const headers = [
            "ID",
            "Usuario",
            "Departamento",
            "Título",
            "Descripción",
            "Fecha",
            "Estado",
            "Asignado a",
        ];

        const rows = transformedTickets.map((ticket) => [
            ticket.id,
            ticket.user.name,
            ticket.user.department,
            ticket.title,
            // Strip markdown and wrap in quotes to handle commas/newlines
            `"${ticket.description.replace(/"/g, '""').replace(/\n/g, " ")}"`,
            ticket.date,
            ticket.status.label,
            ticket.assignedTo?.name ?? "Sin asignar",
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
            type: "text/csv;charset=utf-8;",
        }); // \uFEFF = BOM for Excel UTF-8
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tickets_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.mainContainer}>
            {error && <p role="alert" className={styles.error}>{error}<button type="button" onClick={() => void refetchTickets()}>Reintentar</button></p>}
            {actionMessage && <p role="status" className={styles.success}>{actionMessage}</p>}
            {actionError && <p role="alert" className={styles.error}>{actionError}</p>}
            <TicketsTablePanel
                tickets={transformedTickets}
                loading={isLoading || isUpdating}
                onAssign={handleAssignTicket}
                onDelete={handleCancelTicket}
                onExport={handleExportTickets}
                onRefresh={() => void refetchTickets()}
                onOpenTicket={id => router.push(`/mis-tickets/${encodeURIComponent(id)}${scope === "role" ? "?origen=tickets" : ""}`)}
                onTicketUpdated={refetchTickets}
            />
        </div>
    );
};

export default Tickets;
