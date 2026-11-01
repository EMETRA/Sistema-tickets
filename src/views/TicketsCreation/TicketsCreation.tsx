"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketCreationPanel } from "@/components/client/organisms/TicketCreationPanel";
import { useCreateTicket } from "@/api/hooks/useCreateTicket";
import { TicketFormData } from "@/components/client/organisms/TicketCreationPanel/types";
import styles from "./TicketsCreation.module.scss";
import { ErrorHandler } from "@/api/graphql/errors";
import { useAuthStore } from "@/store/useAuthStore";

export default function CreateTicketPage() {
    const router = useRouter();
    const { createTicket, loading, error, uploadProgress } = useCreateTicket();
    const [formKey, setFormKey] = useState(0);
    const [success, setSuccess] = useState("");

    const userId = useAuthStore((state) => state.getUserId());
    const role = useAuthStore((state) => state.getRole());

    const departments = [
        { label: "Técnico", value: "1" },
        { label: "Desarrollador", value: "2" },
    ];

    const handleTicketSubmit = async (data: TicketFormData) => {
        setSuccess("");
        if (!Number.isSafeInteger(Number(userId)) || Number(userId) <= 0) return;
        try {
            const files = data.files.map((f) => f.file);

            const usuarioAsignadoId =
        role === "ADMINISTRADOR"
            ? userId
                ? parseInt(userId, 10)
                : undefined
            : undefined;

            const result = await createTicket(
                {
                    titulo: data.subject,
                    descripcion: data.description,
                    categoriaId:
            typeof data.departmentId === "string"
                ? parseInt(data.departmentId, 10)
                : data.departmentId,
                    prioridadId: 2,
                    estadoId: usuarioAsignadoId ? 2 : 1,
                    usuarioCreadorId: Number(userId),
                    usuarioAsignadoId: usuarioAsignadoId ? usuarioAsignadoId : undefined,
                    tiempoEstimado: 60,
                },
                files,
            );

            setSuccess(
                `Ticket ${result.ticket.codigo || result.ticket.id} creado correctamente.`,
            );
            setFormKey((prev) => prev + 1);
        } catch (err) {
            console.error("Error al crear el ticket:", err);
        }
    };

    const handleCancel = () => {
        router.push("/mis-tickets");
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
                departments={departments}
                onSubmit={handleTicketSubmit}
                onCancel={handleCancel}
                loading={loading}
                uploadProgress={uploadProgress}
                className={styles.formWrapper}
            />
        </div>
    );
}
