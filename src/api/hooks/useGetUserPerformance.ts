import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";
import { UserPerformanceRow } from '@/api/graphql/admin-dashboard';
import type { UserPerformanceFilters } from '@/api/graphql/admin-dashboard/types';

export interface UserPerformanceOptions {
    fechaInicio?: UserPerformanceFilters['fecha_inicio'];
    fechaFin?: UserPerformanceFilters['fecha_fin'];
    idDepartamento?: UserPerformanceFilters['id_departamento'];
    idUsuario?: UserPerformanceFilters['id_usuario'];
    periodo?: UserPerformanceFilters['periodo'];
}

export function useGetUserPerformance(options?: UserPerformanceOptions) {
    const [data, setData] = useState<UserPerformanceRow[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (options?.fechaInicio) params.append('fecha_inicio', options.fechaInicio);
            if (options?.fechaFin) params.append('fecha_fin', options.fechaFin);
            if (options?.idDepartamento) params.append('id_departamento', String(options.idDepartamento));
            if (options?.idUsuario) params.append('id_usuario', String(options.idUsuario));
            if (options?.periodo) params.append('periodo', options.periodo);

            const url = `/api/admin-dashboard/user-performance${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await apiFetch<{ rows: UserPerformanceRow[] }>(url);
            setData(response.rows || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [options?.fechaInicio, options?.fechaFin, options?.idDepartamento, options?.idUsuario, options?.periodo]);

    // Auto-fetch cuando las opciones cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}
