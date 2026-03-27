"use client";

import React, { useEffect, useRef } from "react";
import { TicketsTablePanel } from "@/components/client/organisms/TicketsTablePanel";
import { Ticket } from "@/components/client/organisms/TicketsTablePanel/types";
import { useDeleteTicket, useGetTickets, useUpdateTicket } from "@/api/hooks";
import styles from "./Tickets.module.scss";
import { ASSIGNABLE_USERS } from "@/api/graphql/queries/getAssignableUsers";

const Tickets: React.FC = () => {
    // Hook para obtener tickets
    const { data: ticketsData, loading: isLoading, error: loadError, refetch: refetchTickets } = useGetTickets();
    const { deleteTicket, loading: isDeleting } = useDeleteTicket();
    const { updateTicket, loading: isAssigning } = useUpdateTicket();

    // Auto-ejecutar refetch al montar el componente (solo una vez)

    const hasRunOnce = useRef(false);

    useEffect(() => {
        if (!hasRunOnce.current) {
            hasRunOnce.current = true;
            refetchTickets();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    const handleDeleteTicket = async (ticketId: string | number) => {

        const tickedIdToDelete = typeof ticketId === "string" ? ticketId : ticketId.toString();
        try {
            const success = await deleteTicket(tickedIdToDelete);

            if (success) {
                alert("Ticket eliminado con éxito");
                await refetchTickets?.();            } else {
                alert("No se pudo eliminar el ticket.");
            }
        } catch (err) {
            console.error("Error al eliminar ticket:", err);
            alert("Ocurrió un error técnico al intentar eliminar el ticket.");
        }
    };

    const handleAssignTicket = async (ticketId: string | number, userId: string | number) => {
        try {
        // 1. Normalizamos los IDs
            const tId = ticketId.toString();
            // El backend espera un Int para el ID de usuario según el README
            const uId = typeof userId === "string" ? parseInt(userId, 10) : userId;

            // 2. Llamamos a tu hook pasando el ID y el objeto 'input'
            // Tu hook espera: updateTicket(id, input)
            const response = await updateTicket(tId, {
                usuarioAsignadoId: uId,
            // Aquí podrías pasar también un estadoId si quisieras 
            // cambiar el estado a "Asignado" (ej: estadoId: 2)
            });

            if (response) {
            // No usamos alert para no interrumpir, pero podrías si prefieres
                console.log("Ticket asignado con éxito");
                await refetchTickets?.();
            }
        } catch (err) {
            console.error("Error al asignar ticket:", err);
            alert("No se pudo realizar la asignación.");
        }
    };

    // Derivar estados
    const error = loadError ? "No fue posible cargar los tickets. Intenta nuevamente." : "";

    // Función para formatear fecha
    // Si es hoy, retorna solo la hora; si no, retorna fecha y hora
    const formatTicketDate = (dateString: string ): string => {
        const ticketDate = new Date(dateString);
        const today = new Date();
        
        const isToday = 
            ticketDate.getDate() === today.getDate() &&
            ticketDate.getMonth() === today.getMonth() &&
            ticketDate.getFullYear() === today.getFullYear();

        if (isToday) {
            // Mostrar solo la hora
            return ticketDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        } else {
            // Mostrar fecha y hora
            return ticketDate.toLocaleString('es-CO', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    // Usuario quemado para todos los tickets (mismo para todos)
    const defaultUser = {
        id: "1",
        name: "Usuario",
        email: "usuario@example.com",
        department: "General"
    };

    // Mapear tickets del API al tipo esperado por TicketsTablePanel
    const transformedTickets: Ticket[] = ticketsData?.map(ticket => {
        // TODO cambiar por la query real de usuarios asignables cuando esté lista
        const assignedUserFound = ASSIGNABLE_USERS.find(
            (u) => u.id === ticket.usuarioAsignadoId?.toString()
        );

        return {
            id: ticket.id,
            user: defaultUser,
            title: ticket.titulo,
            description: ticket.descripcion,
            date: formatTicketDate(ticket.fechaCreacion),
            status: {
                label: `Estado ${ticket.estadoId}`,
                state: "ingressed" as const, 
            },
            assignedTo: assignedUserFound ? {
                id: assignedUserFound.id,
                name: assignedUserFound.userInfo.userName,
                initials: assignedUserFound.userInfo.avatarProps ? assignedUserFound.userInfo.avatarProps.initials : "U",
                avatarSrc: assignedUserFound.userInfo.avatarProps ? assignedUserFound.userInfo.avatarProps.src : ""
            } : null,
        };
    }) || [];

    if (isLoading) {
        return <div className={styles.mainContainer}>Cargando tickets...</div>;
    }

    if (error) {
        return <div className={styles.mainContainer}>{error}</div>;
    }




    return (
        <div className={styles.mainContainer}>
            <TicketsTablePanel
                tickets={transformedTickets}
                loading={isLoading || isDeleting || isAssigning}
                onAssign={handleAssignTicket}
                onDelete={handleDeleteTicket}
                onExport={() => console.log("Exportar tickets")}
            />
        </div>
    );
};

export default Tickets;
