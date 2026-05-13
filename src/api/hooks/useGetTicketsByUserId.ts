'use client';

/**
 * Hook useGetTicketsByUserId
 * ==================
 * Hook personalizado para obtener tickets de un usuario específico
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/tickets/usuario/{userId}')
 * 2. Route handler (src/app/api/tickets/usuario/[userId]/route.ts) recibe request
 * 3. Handler ejecuta query GraphQL en servidor (sin CORS)
 * 4. Hook retorna { data, loading, error, refetch }
 */

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { type Ticket } from '@/api/graphql/tickets';

/**
 * Hook para obtener tickets desde el servidor
 *
 * @param filters Filtros opcionales para buscar tickets
 * @returns { data, loading, error, refetch }
 *
 * Ejemplo de uso:
 * ```ts
 * const { data, loading, error } = useGetTicketsByUserId('123');
 * ```
 */
export function useGetTicketsByUserId(userId: string) {
    const [data, setData] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Ejecuta fetch a /api/tickets con filtros
     */
    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Construir URL
            const url = `/api/tickets/usuario/${userId}`;

            // Hacer request al route handler
            const response = await apiFetch<{ tickets: Ticket[] }>(url);

            setData(response.tickets || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Auto-fetch cuando los filtros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        data,
        loading,
        error,
        refetch,
    };
}
