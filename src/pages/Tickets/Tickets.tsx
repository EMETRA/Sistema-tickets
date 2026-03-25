"use client";

import React from "react";
import { TicketsTablePanel } from "@/components/client/organisms/TicketsTablePanel";
import { Ticket } from "@/components/client/organisms/TicketsTablePanel/types";
import { useGetTickets } from "@/api/hooks";
import styles from "./Tickets.module.scss";

const Tickets: React.FC = () => {
    // Hook para obtener tickets
    const { data: ticketsData, loading: isLoading, error: loadError } = useGetTickets();

    // Derivar estados
    const error = loadError ? "No fue posible cargar los tickets. Intenta nuevamente." : "";

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
    const transformedTickets: Ticket[] = ticketsData?.map(ticket => ({
        id: ticket.id,
        user: defaultUser,
        title: ticket.titulo,
        description: ticket.descripcion,
        date: formatTicketDate(ticket.fechaCreacion),
        status: {
            // TODO: Falta implementar hook useGetTicketStatuses para obtener las etiquetas de estados
            // Por ahora mapear estadoId a un número que representa el estado
            label: `Estado ${ticket.estadoId}`,
            state: "ingressed" as const, // Placeholder: necesita mapeo real de estados
        },
        assignedTo: null, // TODO: Si hay usuarioAsignadoId, mapear a un usuario
    })) || [];

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
                loading={isLoading}
                onAssign={(ticketId, userId) => {
                    // TODO: Implementar mutation assignTicket cuando esté lista
                    console.log(`Asignar ticket ${ticketId} a usuario ${userId}`);
                }}
                onDelete={(ticketId) => {
                    // TODO: Implementar mutation cancelTicket cuando esté lista
                    console.log(`Cancelar ticket ${ticketId}`);
                }}
                onExport={() => console.log("Exportar tickets")}
            />
        </div>
    );
};

export default Tickets;
