import { useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { FuncionesPorUsuarioConsulta, FuncionesPorUsuarioConsultaInput } from '@/api/graphql/MOD06';

export const useGetFuncionesPorUsuarioPermisos = () => {
    const [data, setData] = useState<FuncionesPorUsuarioConsulta | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchPermisos = async (payload: FuncionesPorUsuarioConsultaInput) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<{ data: FuncionesPorUsuarioConsulta }>('/api/MOD06/permisos', undefined, { method: 'POST', body: JSON.stringify(payload) });
            setData(response.data ?? null);
            return response.data ?? null;
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setData(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        isLoading,
        error,
        fetchPermisos,
    };
};
