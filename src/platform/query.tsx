"use client";
import { useEffect, useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
    useQueries,
    useQuery,
    type QueryKey,
    type UseQueryOptions,
} from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { onPlatformMutation, PlatformError, platformFetch } from "./client";

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
    // Después de cualquier guardado (platformCommand) se actualizan las consultas visibles.
    useEffect(
        () => onPlatformMutation(() => void client.invalidateQueries({ queryKey: ["platform"] })),
        [client],
    );
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Clave estándar de una ruta del API: ["platform", "/records/activos?…"]. */
export const platformKey = (path: string): QueryKey => ["platform", path];

type PlatformQueryOptions<T> = Omit<UseQueryOptions<T, Error, T, QueryKey>, "queryKey" | "queryFn"> & {
    /** Contador de «Actualizar» del componente padre: al cambiar, se vuelve a consultar. */
    revision?: number;
};

const fetchPlatform =
    <T,>(path: string) =>
    ({ signal }: { signal: AbortSignal }) =>
        platformFetch<T>(path, { signal: AbortSignal.any([signal, AbortSignal.timeout(45_000)]) });

/** Lee una ruta del API del Panel. `path = null` deja la consulta en espera (p. ej. sin selección). */
export function usePlatformQuery<T>(path: string | null, options: PlatformQueryOptions<T> = {}) {
    const { revision, ...rest } = options;
    return useQuery<T, Error, T, QueryKey>({
        queryKey: revision === undefined ? platformKey(path || "") : [...platformKey(path || ""), revision],
        queryFn: fetchPlatform<T>(path!),
        ...rest,
        enabled: !!path && (rest.enabled ?? true),
    });
}

/**
 * Varias rutas en paralelo. Cada una falla por separado: su dato queda en `null` y las demás se
 * muestran (como los `Promise.all(... .catch(() => null))` anteriores).
 */
export function usePlatformQueries<T>(
    paths: (string | null)[],
    {
        revision,
        enabled = true,
        staleTime,
    }: { revision?: number; enabled?: boolean; staleTime?: number } = {},
) {
    return useQueries({
        queries: paths.map((path) => ({
            queryKey:
                revision === undefined ? platformKey(path || "") : [...platformKey(path || ""), revision],
            queryFn: fetchPlatform<T>(path!),
            enabled: enabled && !!path,
            staleTime,
        })),
        combine: (results) => ({
            data: results.map((r) => (r.data as T | undefined) ?? null),
            pending: results.some((r) => r.isPending && r.fetchStatus !== "idle"),
            error: results.find((r) => r.error)?.error ?? null,
            refetch: () => Promise.all(results.map((r) => r.refetch())),
        }),
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
