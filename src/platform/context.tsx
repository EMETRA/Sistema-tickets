"use client";
import { createContext, useContext, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
    const enabled = !!token && hydrated;
    // Arranque del espacio de trabajo (definiciones, equipos y permisos). Su clave no está bajo
    // «platform»: los guardados no lo vuelven a pedir; se actualiza con refresh() o al cambiar de sesión.
    const query = useQuery({
        queryKey: ["sesion", "bootstrap", token],
        enabled,
        staleTime: Infinity,
        queryFn: async ({ signal }) => {
            const value = await platformFetch<PlatformContextData>("/bootstrap", { signal });
            if (value.enabled !== true || !value.actor || !value.definitions || !Array.isArray(value.teams))
                throw new PlatformError("La respuesta del espacio de trabajo no es válida.", 502);
            return value;
        },
    });
    const data = enabled ? (query.data ?? null) : null;
    // El resto del panel lee el espacio de trabajo vigente fuera de React (platform/runtime).
    useEffect(() => setPlatformRuntime(data), [data]);
    const disabled = query.error instanceof PlatformError && query.error.code === "FEATURE_DISABLED";
    const error =
        query.error && !disabled
            ? query.error instanceof Error
                ? query.error.message
                : "No se pudo cargar tu espacio de trabajo."
            : "";
    const loading = enabled && query.isFetching;
    const { refetch } = query;
    const refresh = useCallback(async () => {
        await refetch();
    }, [refetch]);
    return (
        <Context.Provider value={{ data, loading, error, disabled, refresh }}>{children}</Context.Provider>
    );
}
export function usePlatform() {
    return useContext(Context);
}
