'use client';

/**
 * Hook useGetTechnicianLastTickets
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/technician-last-tickets?limit=...')
 * 2. Route handler ejecuta GET_TECHNICIAN_LAST_TICKETS_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState, useCallback, useEffect } from "react";
import { type TechnicianTicketRow } from "@/api/graphql/technician";

interface TechnicianLastTicketsFilters {
    limit?: number;
}

/**
 * Hook para obtener los últimos tickets del técnico autenticado
 * @param filters Filtro opcional de limit
 * @returns { data, loading, error, refetch }
 */
export function useGetTechnicianLastTickets(filters?: TechnicianLastTicketsFilters) {
    const [data, setData] = useState<TechnicianTicketRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.limit) params.append("limit", String(filters.limit));

            const url = `/api/technician-last-tickets${params.toString() ? `?${params.toString()}` : ""}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.technicianLastTickets || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [filters?.limit]);

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
