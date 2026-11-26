"use client";
import { useEffect, useSyncExternalStore } from "react";

/** Preferencia de apariencia del panel (se guarda en este navegador). */
export type ThemePreference = "light" | "dark" | "system";
export const THEME_KEY = "panel-tema";

const listeners = new Set<() => void>();
const media = () =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

export function readTheme(): ThemePreference {
    try {
        const value = localStorage.getItem(THEME_KEY);
        return value === "dark" || value === "system" ? value : "light";
    } catch {
        return "light";
    }
}

/** Tema efectivo: resuelve «Según el sistema» con la preferencia del equipo. */
export function resolveTheme(preference: ThemePreference): "light" | "dark" {
    if (preference === "system") return media()?.matches ? "dark" : "light";
    return preference;
}

export function applyTheme(preference: ThemePreference) {
    const root = document.documentElement;
    root.dataset.theme = resolveTheme(preference);
    root.dataset.themePreference = preference;
}

export function setTheme(preference: ThemePreference) {
    try {
        localStorage.setItem(THEME_KEY, preference);
    } catch {
        /* sin almacenamiento: se aplica solo en esta sesión */
    }
    applyTheme(preference);
    listeners.forEach((l) => l());
}

export function useThemePreference(): ThemePreference {
    return useSyncExternalStore(
        (notify) => {
            listeners.add(notify);
            return () => listeners.delete(notify);
        },
        readTheme,
        () => "light",
    );
}

/** Mantiene «Según el sistema» sincronizado si el equipo cambia de claro a oscuro. */
export function useThemeSync() {
    const preference = useThemePreference();
    useEffect(() => {
        applyTheme(preference);
        if (preference !== "system") return;
        const query = media();
        const update = () => applyTheme("system");
        query?.addEventListener("change", update);
        return () => query?.removeEventListener("change", update);
    }, [preference]);
}

/* ── Accesibilidad: tamaño del texto, contraste y animaciones ────────────
   Se guardan en este navegador y se aplican como atributos de <html>
   (data-text-size, data-contrast, data-motion); los estilos viven en
   theme/accessibility.css. */
export type TextSize = "normal" | "large" | "xlarge";
export type ContrastPreference = "normal" | "more";
export type MotionPreference = "system" | "reduce";
export type AccessibilityPrefs = {
    textSize: TextSize;
    contrast: ContrastPreference;
    motion: MotionPreference;
};

const A11Y_KEYS: { [K in keyof AccessibilityPrefs]: { key: string; attr: string; values: readonly AccessibilityPrefs[K][] } } = {
    textSize: { key: "panel-texto", attr: "textSize", values: ["normal", "large", "xlarge"] },
    contrast: { key: "panel-contraste", attr: "contrast", values: ["normal", "more"] },
    motion: { key: "panel-animaciones", attr: "motion", values: ["system", "reduce"] },
};

function readPref<K extends keyof AccessibilityPrefs>(name: K): AccessibilityPrefs[K] {
    const { key, values } = A11Y_KEYS[name];
    try {
        const value = localStorage.getItem(key) as AccessibilityPrefs[K] | null;
        return value && values.includes(value) ? value : values[0];
    } catch {
        return values[0];
    }
}

let a11ySnapshot: AccessibilityPrefs | null = null;
const A11Y_DEFAULTS: AccessibilityPrefs = { textSize: "normal", contrast: "normal", motion: "system" };

export function readAccessibility(): AccessibilityPrefs {
    const next = { textSize: readPref("textSize"), contrast: readPref("contrast"), motion: readPref("motion") };
    if (
        !a11ySnapshot ||
        a11ySnapshot.textSize !== next.textSize ||
        a11ySnapshot.contrast !== next.contrast ||
        a11ySnapshot.motion !== next.motion
    )
        a11ySnapshot = next;
    return a11ySnapshot;
}

/**
 * Factor real con el que el navegador escala la interfaz (1 sin zoom).
 * Sirve para convertir medidas de getBoundingClientRect a px de CSS y para
 * saber si vh/vw se multiplican con el zoom (Chrome y Firefox sí).
 */
export function measureUiScale() {
    if (typeof document === "undefined") return { scale: 1, viewport: 1 };
    const probe = document.createElement("div");
    probe.style.cssText =
        "position:fixed;left:0;top:0;width:100px;height:100vh;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    probe.remove();
    return {
        scale: rect.width / 100 || 1,
        viewport: window.innerHeight ? rect.height / window.innerHeight : 1,
    };
}

function syncViewportZoom() {
    const root = document.documentElement;
    root.style.removeProperty("--vp-zoom");
    const { viewport } = measureUiScale();
    const expected = parseFloat(getComputedStyle(root).getPropertyValue("--vp-zoom")) || 1;
    if (Math.abs(viewport - expected) > 0.01) root.style.setProperty("--vp-zoom", viewport.toFixed(4));
}

function applyAccessibility(prefs: AccessibilityPrefs) {
    const root = document.documentElement;
    for (const name of Object.keys(A11Y_KEYS) as (keyof AccessibilityPrefs)[])
        root.dataset[A11Y_KEYS[name].attr] = prefs[name];
    syncViewportZoom();
}

export function setAccessibility<K extends keyof AccessibilityPrefs>(name: K, value: AccessibilityPrefs[K]) {
    try {
        localStorage.setItem(A11Y_KEYS[name].key, value);
    } catch {
        /* sin almacenamiento: se aplica solo en esta sesión */
    }
    applyAccessibility({ ...readAccessibility(), [name]: value });
    listeners.forEach((l) => l());
}

export function useAccessibility(): AccessibilityPrefs {
    return useSyncExternalStore(
        (notify) => {
            listeners.add(notify);
            return () => listeners.delete(notify);
        },
        readAccessibility,
        () => A11Y_DEFAULTS,
    );
}

/** Reaplica las preferencias de accesibilidad (p. ej. tras cambiarlas en otra pestaña). */
export function useAccessibilitySync() {
    const prefs = useAccessibility();
    useEffect(() => {
        applyAccessibility(prefs);
        const onStorage = (e: StorageEvent) => {
            if (e.key && [THEME_KEY, ...Object.values(A11Y_KEYS).map((k) => k.key)].includes(e.key)) {
                applyTheme(readTheme());
                listeners.forEach((l) => l());
            }
        };
        window.addEventListener("storage", onStorage);
        // El zoom móvil cambia con el ancho (media query): volver a medir.
        window.addEventListener("resize", syncViewportZoom);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("resize", syncViewportZoom);
        };
    }, [prefs]);
}

const A11Y_BOOT = Object.values(A11Y_KEYS)
    .map(({ key, attr, values }) => `v=localStorage.getItem("${key}");r.dataset.${attr}=${JSON.stringify(values)}.indexOf(v)>=0?v:"${values[0]}";`)
    .join("");

/** Script previo al pintado: evita el destello claro (y saltos de tamaño) al cargar. */
export const THEME_BOOT_SCRIPT = `(function(){try{var r=document.documentElement,v;var p=localStorage.getItem("${THEME_KEY}")||"light";var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.dataset.theme=d?"dark":"light";r.dataset.themePreference=p;${A11Y_BOOT}}catch(e){}})();`;
