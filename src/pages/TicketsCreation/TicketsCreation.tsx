"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketCreationPanel } from "@/components/client/organisms/TicketCreationPanel";
import { useCreateTicket } from "@/api/hooks/useCreateTicket";
import { TicketFormData } from "@/components/client/organisms/TicketCreationPanel/types";
import styles from "./TicketsCreation.module.scss";
import { useAuthStore } from "@/store/useAuthStore";

export default function CreateTicketPage() {
    const router = useRouter();
    const { createTicket, loading, error, uploadProgress } = useCreateTicket();
    const [formKey, setFormKey] = useState(0);

    const userId = useAuthStore((state) => state.getUserId());
    const role = useAuthStore((state) => state.getRole());

    const departments = [
        { label: "Técnico", value: "1" },
        { label: "Desarrollador", value: "2" },
    ];

    const handleTicketSubmit = async (data: TicketFormData) => {
        try {
            const files = data.files.map(f => f.file);

            const usuarioAsignadoId = ['ADMINISTRADOR', 'TECNICO', 'DESARROLLADOR'].includes(role)
                ? userId ? parseInt(userId, 10) : undefined
                : undefined;

            await createTicket({
                titulo: data.subject,
                descripcion: data.description,
                categoriaId: typeof data.departmentId === "string"
                    ? parseInt(data.departmentId, 10)
                    : data.departmentId,
                prioridadId: 2,
                estadoId: 1,
                usuarioCreadorId: userId ? parseInt(userId, 10) : 1,
                usuarioAsignadoId: usuarioAsignadoId ? usuarioAsignadoId : undefined,
                tiempoEstimado: 60,
            }, files);

            alert("Ticket creado con éxito.");
            setFormKey(prev => prev + 1);
        } catch (err) {
            console.error("Error al crear el ticket:", err);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className={styles.pageContainer}>
            {error && <p className={styles.errorMessage}>{error.message}</p>}

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