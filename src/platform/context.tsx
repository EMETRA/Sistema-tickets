"use client";
import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useState,
    useRef,
} from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { platformFetch, PlatformError } from "./client";
import { setPlatformRuntime } from "./runtime";
import type { PlatformContextData } from "./types";
type State = {
    data: PlatformContextData | null;
    loading: boolean;
    error: string;
    disabled: boolean;
    refresh: () => Promise<void>;
};
const Context = createContext<State>({
    data: null,
    loading: true,
    error: "",
    disabled: false,
    refresh: async () => {},
});
export function PlatformProvider({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token),
        hydrated = useAuthStore((s) => s.isHydrated);
    const [data, setData] = useState<PlatformContextData | null>(null),
        [loading, setLoading] = useState(true),
        [error, setError] = useState(""),
        [disabled, setDisabled] = useState(false);
    const generation = useRef(0);
    const refresh = useCallback(async () => {
        const version = ++generation.current;
        if (!token || !hydrated) {
            setPlatformRuntime(null);
            setData(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError("");
        try {
            const value =
                await platformFetch<PlatformContextData>("/bootstrap");
            if (version !== generation.current) return;
            if (
                value.enabled !== true ||
                !value.actor ||
                !value.definitions ||
                !Array.isArray(value.teams)
            )
                throw new PlatformError(
                    "La respuesta del espacio de trabajo no es válida.",
                    502,
                );
            setData(value);
            setPlatformRuntime(value);
            setDisabled(false);
        } catch (e) {
            if (version !== generation.current) return;
            setData(null);
            if (e instanceof PlatformError && e.code === "FEATURE_DISABLED")
                setDisabled(true);
            else
                setError(
                    e instanceof Error
                        ? e.message
                        : "No se pudo cargar tu espacio de trabajo.",
                );
        } finally {
            if (version === generation.current) setLoading(false);
        }
    }, [token, hydrated]);
    const invalidate = useCallback(() => {
        generation.current++;
        setPlatformRuntime(null);
    }, []);
    useEffect(() => {
        void refresh();
        return invalidate;
    }, [refresh, invalidate]);
    return (
        <Context.Provider value={{ data, loading, error, disabled, refresh }}>
            {children}
        </Context.Provider>
    );
}
export function usePlatform() {
    return useContext(Context);
}
