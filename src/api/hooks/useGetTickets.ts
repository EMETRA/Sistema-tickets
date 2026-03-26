'use client';

/**
 * Hook useGetTickets
 * ==================
 * Hook personalizado para obtener tickets con soporte de filtros
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/tickets?filtros')
 * 2. Route handler (src/app/api/tickets/route.ts) recibe request
 * 3. Handler ejecuta query GraphQL en servidor (sin CORS)
 * 4. Hook retorna { data, loading, error, refetch }
 */

import { useState, useCallback, useEffect } from 'react';
import { type Ticket, type TicketFilterInput } from '@/api/graphql/tickets';

/**
 * Hook para obtener tickets desde el servidor
 *
 * @param filters Filtros opcionales para buscar tickets
 * @returns { data, loading, error, refetch }
 *
 * Ejemplo de uso:
 * ```ts
 * const { data, loading, error } = useGetTickets();
 * const { data: filtered } = useGetTickets({ estadoId: '1', prioridadId: '2' });
 * ```
 */
export function useGetTickets(filters?: TicketFilterInput) {
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
            // Construir query params de filtros
            const params = new URLSearchParams();

            if (filters) {
                // Para cada filtro, convertir a número si es necesario
                if (filters.categoriaId) params.append('categoriaId', String(filters.categoriaId));
                if (filters.estadoId) params.append('estadoId', String(filters.estadoId));
                if (filters.prioridadId) params.append('prioridadId', String(filters.prioridadId));
                if (filters.usuarioAsignadoId)
                    params.append('usuarioAsignadoId', String(filters.usuarioAsignadoId));
            }

            // Construir URL
            const url = `/api/tickets${params.toString() ? `?${params.toString()}` : ''}`;

            // Hacer request al route handler
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.tickets || []);
            // console.log('tickets:', result.tickets);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            // console.error('error:', error.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

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
