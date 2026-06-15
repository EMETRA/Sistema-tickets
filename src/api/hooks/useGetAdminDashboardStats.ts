import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { AdminDashboardStats } from '@/api/graphql/admin-dashboard';

export interface AdminDashboardStatsOptions {
    fecha_inicio?: string;
    fecha_fin?: string;
    id_departamento?: number;
}

export function useGetAdminDashboardStats(options?: AdminDashboardStatsOptions) {
    const [data, setData] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (options?.fecha_inicio) params.append('fecha_inicio', options.fecha_inicio);
            if (options?.fecha_fin) params.append('fecha_fin', options.fecha_fin);
            if (options?.id_departamento) params.append('id_departamento', String(options.id_departamento));

            const url = `/api/admin-dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiFetch(url) as unknown as AdminDashboardStats;
            setData(response);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [options?.fecha_inicio, options?.fecha_fin, options?.id_departamento]);

    // Auto-fetch cuando los parámetros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}
