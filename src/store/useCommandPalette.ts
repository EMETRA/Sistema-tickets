import { create } from "zustand";

interface CommandPaletteState {
    open: boolean;
    show: () => void;
    hide: () => void;
    toggle: () => void;
}

export const useCommandPalette = create<CommandPaletteState>((set) => ({
    open: false,
    show: () => set({ open: true }),
    hide: () => set({ open: false }),
    toggle: () => set((s) => ({ open: !s.open })),
}));
