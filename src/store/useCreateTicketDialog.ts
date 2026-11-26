import { create } from "zustand";

/**
 * Abre el formulario de "Crear ticket" como ventana desde cualquier vista
 * (barra superior, Mis tickets, Inicio) y avisa a las listas cuando se creó uno.
 */
interface CreateTicketDialogState {
    open: boolean;
    /** Aumenta con cada ticket creado; las listas lo observan para refrescarse. */
    createdVersion: number;
    show: () => void;
    hide: () => void;
    notifyCreated: () => void;
}

export const useCreateTicketDialog = create<CreateTicketDialogState>((set) => ({
    open: false,
    createdVersion: 0,
    show: () => set({ open: true }),
    hide: () => set({ open: false }),
    notifyCreated: () => set((s) => ({ createdVersion: s.createdVersion + 1 })),
}));
