"use client";

import React, { useEffect, useState } from "react";
import { TicketsTablePanel } from "@/components/client/organisms/TicketsTablePanel";
import { Ticket } from "@/components/client/organisms/TicketsTablePanel/types";
import {
  assignTicketDummy,
  cancelTicketDummy,
  getTicketsDummy,
} from "@/api/graphql/queries/getTickets";
import styles from "./Tickets.module.scss";

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      setError("");
      const data = await getTicketsDummy();
      setTickets(data);
    } catch (loadError) {
      console.error("Error cargando tickets:", loadError);
      setError("No fue posible cargar los tickets. Intenta nuevamente.");
    }
  };

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      await loadTickets();
      setIsLoading(false);
    };

    run();
  }, []);

  const handleAssignTicket = async (ticketId: string | number, userId: string) => {
    await assignTicketDummy(ticketId, userId);
    await loadTickets();
  };

  const handleCancelTicket = async (ticketId: string | number) => {
    await cancelTicketDummy(ticketId);
    await loadTickets();
  };

  if (isLoading) {
    return <div className={styles.mainContainer}>Cargando tickets...</div>;
  }

  if (error) {
    return <div className={styles.mainContainer}>{error}</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <TicketsTablePanel
        tickets={tickets}
        loading={isLoading}
        onAssign={handleAssignTicket}
        onDelete={handleCancelTicket}
        onExport={() => console.log("Exportar tickets")}
      />
    </div>
  );
};

export default Tickets;
