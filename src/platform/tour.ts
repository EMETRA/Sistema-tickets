"use client";
import { useSyncExternalStore } from "react";
import { TOUR_VERSION } from "@/config/guided-tour";

/** Estado del recorrido guiado: se recuerda por navegador, como el tema. */
const KEY = "panel-recorrido";
const listeners = new Set<() => void>();
let open = false;

const emit = () => listeners.forEach((l) => l());

export function tourSeen() {
    try {
        return (localStorage.getItem(KEY) || "").startsWith(TOUR_VERSION + ":");
    } catch {
        return true;
    }
}

export function startTour() {
    open = true;
    emit();
}

export function closeTour(result: "completado" | "omitido") {
    open = false;
    try {
        localStorage.setItem(KEY, `${TOUR_VERSION}:${result}`);
    } catch {
        /* sin almacenamiento: se volverá a ofrecer la próxima vez */
    }
    emit();
}

export function useTourOpen() {
    return useSyncExternalStore(
        (notify) => {
            listeners.add(notify);
            return () => listeners.delete(notify);
        },
        () => open,
        () => false,
    );
}
