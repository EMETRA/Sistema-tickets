"use client";
import { useMemo, useSyncExternalStore } from "react";

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
        window.dispatchEvent(new Event(RECENTS_KEY));
    } catch {
        /* almacenamiento no disponible: se omite sin afectar la navegación */
    }
}

const snapshot = () => {
    try {
        return localStorage.getItem(RECENTS_KEY) || "[]";
    } catch {
        return "[]";
    }
};
const subscribe = (notify: () => void) => {
    window.addEventListener(RECENTS_KEY, notify);
    window.addEventListener("storage", notify);
    return () => {
        window.removeEventListener(RECENTS_KEY, notify);
        window.removeEventListener("storage", notify);
    };
};

/** Recientes como estado de React (se actualizan al abrir módulos, también en otras pestañas). */
export function useRecents(): RecentModule[] {
    const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
    return useMemo(() => {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
        } catch {
            return [];
        }
    }, [raw]);
}
