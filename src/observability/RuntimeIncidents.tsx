"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
const KEY = "tickets-runtime-pending";
const CODES = ["JS_RUNTIME_ERROR", "JS_REJECTION", "REACT_RENDER_ERROR"];
type Event = { referencia: string; codigo: string; operacion: string };
function pending(): Event[] {
    try {
        const data: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
        if (!Array.isArray(data)) return [];
        return data.filter((value: unknown): value is Event => {
            if (!value || typeof value !== 'object') return false;
            const event = value as Record<string, unknown>;
            return typeof event.codigo === 'string' && CODES.includes(event.codigo) && typeof event.referencia === 'string' && /^[a-f0-9-]{36}$/.test(event.referencia) && typeof event.operacion === 'string' && /^(home|mis-tickets|aplicaciones|espacio|mod04|mod05|mod06)$/.test(event.operacion);
        }).slice(-50);
    } catch { return []; }
}

let flushing = false;
async function flush() {
    const token = useAuthStore.getState().token;
    if (!token || flushing) return;
    flushing = true;
    try {
        for (const event of pending()) {
            const response = await fetch("/api/platform/client-errors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify(event),
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) break;
            const result = (await response.json()) as { encolada?: boolean };
            if (!result.encolada) break;
            localStorage.setItem(
                KEY,
                JSON.stringify(
                    pending().filter((e) => e.referencia !== event.referencia),
                ),
            );
        }
    } catch {
        /* Se reintenta con la sesión vigente; nunca se guarda el token. */
    } finally {
        flushing = false;
    }
}
export function reportRuntimeIncident(codigo: string) {
    if (typeof window === "undefined" || !CODES.includes(codigo)) return;
    const path = window.location.pathname;
    const moduleId = path.match(/\/(mod04|mod05|mod06)(?:\/|$)/)?.[1];
    const root = path.split("/")[1];
    const operacion =
        moduleId ||
        (["home", "mis-tickets", "aplicaciones", "espacio"].includes(root)
            ? root
            : "home");
    try {
        const events = pending();
        if (
            !events.some(
                (e) => e.codigo === codigo && e.operacion === operacion,
            )
        )
            localStorage.setItem(
                KEY,
                JSON.stringify(
                    [
                        ...events,
                        { referencia: crypto.randomUUID(), codigo, operacion },
                    ].slice(-50),
                ),
            );
    } catch {
        return;
    }
    void flush();
}
export function RuntimeIncidents() {
    const token = useAuthStore((s) => s.token);
    useEffect(() => {
        const error = () => reportRuntimeIncident("JS_RUNTIME_ERROR");
        const rejection = () => reportRuntimeIncident("JS_REJECTION");
        window.addEventListener("error", error);
        window.addEventListener("unhandledrejection", rejection);
        window.addEventListener("online", flush);
        const timer = window.setInterval(() => void flush(), 30000);
        void flush();
        return () => {
            window.removeEventListener("error", error);
            window.removeEventListener("unhandledrejection", rejection);
            window.removeEventListener("online", flush);
            window.clearInterval(timer);
        };
    }, [token]);
    return null;
}
