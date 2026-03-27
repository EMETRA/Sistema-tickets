import { useState, useCallback, useEffect } from 'react';
import { UserPerformanceResponse } from '@/api/graphql/admin-dashboard';

export interface UserPerformanceOptions {
    fecha_inicio?: string;
    fecha_fin?: string;
    id_departamento?: number;
    id_usuario?: number;
}

export function useGetUserPerformance(options?: UserPerformanceOptions) {
    const [data, setData] = useState<UserPerformanceResponse | null>(null);
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
            if (options?.id_usuario) params.append('id_usuario', String(options.id_usuario));

            const url = `/api/admin-dashboard/user-performance${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const result = await response.json();
            setData(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [options?.fecha_inicio, options?.fecha_fin, options?.id_departamento, options?.id_usuario]);

    // Auto-fetch cuando las opciones cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}
