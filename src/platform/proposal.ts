"use client";
import { useSyncExternalStore } from "react";

/**
 * Propuesta «Panel institucional». Se activa desde el laboratorio local
 * (cookie panel_propuesta=1) para compararla con el diseño actual sin
 * alterar el comportamiento por defecto.
 */
const read = () =>
    typeof document !== "undefined" &&
    /(?:^|;\s*)panel_propuesta=1(?:;|$)/.test(document.cookie);

export function useProposalDesign() {
    return useSyncExternalStore(
        () => () => {},
        read,
        () => false,
    );
}

/** Módulos de aplicaciones visitados recientemente (solo en este navegador). */
export type RecentModule = { path: string; title: string; area: string; at: number };
const RECENTS_KEY = "panel-recientes";

export function readRecents(): RecentModule[] {
    try {
        const raw = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
        return Array.isArray(raw) ? raw.slice(0, 8) : [];
    } catch {
        return [];
    }
}

export function rememberModule(entry: Omit<RecentModule, "at">) {
    try {
        const next = [
            { ...entry, at: Date.now() },
            ...readRecents().filter((r) => r.path !== entry.path),
        ].slice(0, 8);
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
        /* almacenamiento no disponible: se omite sin afectar la navegación */
    }
}
