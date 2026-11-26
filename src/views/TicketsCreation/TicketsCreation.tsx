"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketCreationPanel } from "@/features/tickets/components/TicketCreationPanel";
import { TicketFormData } from "@/features/tickets/components/TicketCreationPanel/types";
import styles from "./TicketsCreation.module.scss";
import { ErrorHandler } from "@/api/graphql/errors";
import { useCreateTicketDialog } from "@/store/useCreateTicketDialog";
import { TICKET_DEPARTMENTS, useSubmitTicket } from "./useSubmitTicket";

/** Página directa (enlaces compartidos); el flujo habitual abre la ventana. */
export default function CreateTicketPage() {
    const router = useRouter();
    const { submit, loading, error, uploadProgress } = useSubmitTicket();
    const notifyCreated = useCreateTicketDialog((s) => s.notifyCreated);
    const [formKey, setFormKey] = useState(0);
    const [success, setSuccess] = useState("");

    const handleTicketSubmit = async (data: TicketFormData) => {
        setSuccess("");
        try {
            const ticket = await submit(data);
            if (!ticket) return;
            setSuccess(`Ticket ${ticket.codigo || ticket.id} creado correctamente.`);
            setFormKey((prev) => prev + 1);
            notifyCreated();
        } catch (err) {
            console.error("Error al crear el ticket:", err);
        }
    };

    return (
        <div className={styles.pageContainer}>
            {success && (
                <p role="status" className={styles.successMessage}>
                    {success}
                </p>
            )}
            {error && <p className={styles.errorMessage}>{ErrorHandler.getUserMessage(error)}</p>}

            <TicketCreationPanel
                key={formKey}
                departments={TICKET_DEPARTMENTS}
                onSubmit={handleTicketSubmit}
                onCancel={() => router.push("/mis-tickets")}
                loading={loading}
                uploadProgress={uploadProgress}
                className={styles.formWrapper}
            />
        </div>
    );
}
