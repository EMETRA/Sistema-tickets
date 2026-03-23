'use client';

/**
 * Hook useGetTechnicianEvents
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/technician-events?fecha_inicio=...&fecha_fin=...')
 * 2. Route handler ejecuta GET_TECHNICIAN_EVENTS_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { type TechnicianEventRow } from "@/api/graphql/technician";

interface TechnicianEventsFilters {
    fecha_inicio?: string;
    fecha_fin?: string;
}

/**
 * Hook para obtener eventos del técnico autenticado
 * @param filters Filtros opcionales de fecha
 * @returns { data, loading, error, refetch }
 */
export function useGetTechnicianEvents(filters?: TechnicianEventsFilters) {
    const [data, setData] = useState<TechnicianEventRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (filters?.fecha_inicio) params.append("fecha_inicio", filters.fecha_inicio);
            if (filters?.fecha_fin) params.append("fecha_fin", filters.fecha_fin);

            const url = `/api/technician-events${params.toString() ? `?${params.toString()}` : ""}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.TechnicianEvents || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        refetch,
    };
}
