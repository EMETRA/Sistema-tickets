"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TicketCreationPanel } from "@/components/client/organisms/TicketCreationPanel";
import styles from "./TicketsCreation.module.scss";

export default function CreateTicketPage() {
    const router = useRouter();

    const departments = [
        { label: "Informática / IT", value: "1" },
        { label: "Mantenimiento", value: "2" },
        { label: "Recursos Humanos", value: "3" },
        { label: "Administración", value: "4" },
    ];

    const handleTicketSubmit = async (data: unknown) => {
        console.log("Datos del nuevo ticket para EMETRA:", data);
        // Lógica de carga...
        // await createTicket({ variables: data });
        
        // Al terminar, regresamos al historial
        router.push("/tickets");
    };

    const handleCancel = () => {
        router.back(); // Regresa a la página anterior
    };

    return (
        <div className={styles.pageContainer}>
            <TicketCreationPanel 
                departments={departments}
                onSubmit={handleTicketSubmit}
                onCancel={handleCancel}
                className={styles.formWrapper}
            />
        </div>
    );
}