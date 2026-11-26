"use client";
import { useEffect, useState } from "react";
import { PopOver } from "@/components/client/atoms/PopOver";
import { TicketCreationPanel } from "@/components/client/organisms/TicketCreationPanel";
import { TicketDetail } from "@/components/client/organisms/TicketDetail";
import type { TicketFormData } from "@/components/client/organisms/TicketCreationPanel/types";
import { ErrorHandler } from "@/api/graphql/errors";
import { useCreateTicketDialog } from "@/store/useCreateTicketDialog";
import {
    TICKET_DEPARTMENTS,
    useSubmitTicket,
} from "@/views/TicketsCreation/useSubmitTicket";
import styles from "./CreateTicketDialog.module.scss";

type Created = { id: string; label: string };

/** Ventana global de "Crear ticket"; se monta una vez en el layout. */
export function CreateTicketDialog() {
    const { open, hide, notifyCreated } = useCreateTicketDialog();
    const { submit, loading, error, uploadProgress } = useSubmitTicket();
    const [formKey, setFormKey] = useState(0);
    const [created, setCreated] = useState<Created | null>(null);
    const [viewing, setViewing] = useState<string | null>(null);

    useEffect(() => {
        if (!created) return;
        const timer = setTimeout(() => setCreated(null), 8000);
        return () => clearTimeout(timer);
    }, [created]);

    const close = () => {
        if (loading) return;
        hide();
        setFormKey((k) => k + 1);
    };

    const handleSubmit = async (data: TicketFormData) => {
        try {
            const ticket = await submit(data);
            if (!ticket) return;
            setCreated({
                id: String(ticket.id),
                label: ticket.codigo || "#" + ticket.id,
            });
            notifyCreated();
            hide();
            setFormKey((k) => k + 1);
        } catch (err) {
            console.error("Error al crear el ticket:", err);
        }
    };

    return (
        <>
            <PopOver
                isOpen={open}
                onClose={close}
                position="center"
                ariaLabel="Nuevo ticket"
                className={styles.dialog}
            >
                <header className={styles.header}>
                    <div>
                        <h2>Nuevo ticket</h2>
                        <p>
                            Describe la solicitud; el área elegida la recibirá
                            en su bandeja.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={close}
                        aria-label="Cerrar ventana de nuevo ticket"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </header>
                {error && (
                    <p role="alert" className={styles.error}>
                        {ErrorHandler.getUserMessage(error)}
                    </p>
                )}
                <TicketCreationPanel
                    key={formKey}
                    variant="dialog"
                    departments={TICKET_DEPARTMENTS}
                    onSubmit={handleSubmit}
                    onCancel={close}
                    loading={loading}
                    uploadProgress={uploadProgress}
                />
            </PopOver>
            <PopOver
                isOpen={!!created}
                onClose={() => setCreated(null)}
                withOverlay={false}
                position="bottom-right"
                ariaLabel="Ticket creado"
                className={styles.toast}
            >
                <div role="status" className={styles.toastBody}>
                    <span className={styles.toastIcon} aria-hidden="true">
                        ✓
                    </span>
                    <div>
                        <strong>Ticket {created?.label} creado</strong>
                        <p>Puedes seguirlo desde Mis tickets.</p>
                    </div>
                    <button
                        type="button"
                        className={styles.toastAction}
                        onClick={() => {
                            setViewing(created?.id || null);
                            setCreated(null);
                        }}
                    >
                        Ver ticket
                    </button>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={() => setCreated(null)}
                        aria-label="Cerrar aviso"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
            </PopOver>
            <TicketDetail
                isOpen={!!viewing}
                ticketId={viewing || ""}
                onClose={() => setViewing(null)}
            />
        </>
    );
}
export default CreateTicketDialog;
