"use client";
import { useLayoutEffect } from "react";
import { applyStoredPreferences } from "./theme";

/**
 * React 19 reaplica los atributos de <html> al hidratar y puede quitar los que
 * puso el script de arranque (tema, tamaño del texto, contraste). Esto los
 * restituye antes del primer pintado y luego habilita las transiciones, para
 * que el modo oscuro o la letra grande no «destellen» al cargar.
 */
export function ThemeAttributes() {
    useLayoutEffect(() => {
        applyStoredPreferences();
        const frame = requestAnimationFrame(() => {
            document.documentElement.dataset.ready = "true";
        });
        return () => cancelAnimationFrame(frame);
    }, []);
    return null;
}
