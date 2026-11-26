"use client";
import { useCallback } from "react";
import { useCreateTicket } from "@/api/hooks/useCreateTicket";
import type { TicketFormData } from "@/components/client/organisms/TicketCreationPanel/types";
import { useAuthStore } from "@/store/useAuthStore";

export const TICKET_DEPARTMENTS = [
    { label: "Técnico", value: "1" },
    { label: "Desarrollador", value: "2" },
];

/** Flujo único de creación: lo comparten la página /tickets-creation y la ventana. */
export function useSubmitTicket() {
    const { createTicket, loading, error, uploadProgress } = useCreateTicket();
    const userId = useAuthStore((state) => state.getUserId());
    const role = useAuthStore((state) => state.getRole());

    const submit = useCallback(
        async (data: TicketFormData) => {
            if (!Number.isSafeInteger(Number(userId)) || Number(userId) <= 0) return null;
            const usuarioAsignadoId = role === "ADMINISTRADOR" && userId ? parseInt(userId, 10) : undefined;
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
                    usuarioAsignadoId,
                    tiempoEstimado: 60,
                },
                data.files.map((f) => f.file),
            );
            return result.ticket;
        },
        [createTicket, role, userId],
    );

    return { submit, loading, error, uploadProgress };
}
