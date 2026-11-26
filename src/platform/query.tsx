"use client";
import { useEffect, useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
    type QueryKey,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { PlatformError, platformFetch } from "./client";

/**
 * Consultas al API del Panel con TanStack Query: caché compartida entre
 * pantallas, cancelación al desmontar, reintento ante fallas de red y
 * actualización con `refetch()` o invalidando la clave.
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Muestra al instante lo que ya está en caché y lo actualiza al volver a la pantalla
                // (mismo resultado que antes, sin pantallas en blanco). Las listas estables (personas)
                // definen su propio staleTime.
                staleTime: 0,
                gcTime: 5 * 60_000,
                refetchOnWindowFocus: false,
                // Reintenta solo fallas temporales: sin conexión, tiempo agotado o servidor no disponible
                // (502, 503, 504). Permisos, validación o «no implementado» se muestran de inmediato.
                retry: (failures, error) =>
                    failures < 2 &&
                    (!(error instanceof PlatformError) || [502, 503, 504].includes(error.status)),
            },
        },
    });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = useState(makeQueryClient);
    const token = useAuthStore((s) => s.token);
    // Al cambiar de sesión no deben quedar datos de la cuenta anterior.
    useEffect(() => () => client.clear(), [client, token]);
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Clave estándar de una ruta del API: ["platform", "/records/activos?…"]. */
export const platformKey = (path: string): QueryKey => ["platform", path];

/** Lee una ruta del API del Panel. `path = null` deja la consulta en espera (p. ej. sin selección). */
export function usePlatformQuery<T>(
    path: string | null,
    options: Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryKey" | "queryFn"> = {},
) {
    return useQuery<T, Error, T, QueryKey>({
        queryKey: platformKey(path || ""),
        queryFn: ({ signal }) =>
            platformFetch<T>(path!, { signal: AbortSignal.any([signal, AbortSignal.timeout(45_000)]) }),
        ...options,
        enabled: !!path && (options.enabled ?? true),
    });
}

/** Mensaje legible de un error de consulta (con referencia de soporte si existe). */
export function queryErrorMessage(error: unknown, fallback = "No se pudo cargar la información.") {
    if (!error) return "";
    const message = error instanceof Error && error.message ? error.message : fallback;
    return error instanceof PlatformError && error.reference
        ? `${message} Referencia: ${error.reference}`
        : message;
}
