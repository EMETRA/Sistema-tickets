"use client";

import React, { useState } from "react"; // 👈 Añadimos useState
import { useRouter } from "next/navigation";
import { TicketCreationPanel } from "@/components/client/organisms/TicketCreationPanel";
import { useCreateTicket } from "@/api/hooks/useCreateTicket";
import { TicketFormData } from "@/components/client/organisms/TicketCreationPanel/types";
import styles from "./TicketsCreation.module.scss";

export default function CreateTicketPage() {
    const router = useRouter();
    const { createTicket, loading, error } = useCreateTicket();
    const [formKey, setFormKey] = useState(0);

    const departments = [
        { label: "Informática / IT", value: "1" },
        { label: "Mantenimiento", value: "2" },
        { label: "Recursos Humanos", value: "3" },
        { label: "Administración", value: "4" },
    ];

    const handleTicketSubmit = async (data: TicketFormData) => {
        try {
            await createTicket({
                titulo: data.subject,
                descripcion: data.description,
                categoriaId: typeof data.departmentId === "string" ? parseInt(data.departmentId, 10) : data.departmentId,
                prioridadId: 2, 
                estadoId: 1, 
                usuarioCreadorId: 100,
                usuarioAsignadoId: 101, 
                tiempoEstimado: 60,
            });

            console.log("Ticket creado con éxito");
            alert("Ticket creado con éxito. Puedes ingresar el siguiente.");
            
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
                className={styles.formWrapper}
            />
        </div>
    );
}