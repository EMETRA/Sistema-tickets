import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { FuncionesPorUsuarioEmpresa, GetFuncionesPorUsuarioEmpresasResponse } from '@/api/graphql/MOD06';

export const useGetFuncionesPorUsuarioEmpresas = () => {
    const [data, setData] = useState<FuncionesPorUsuarioEmpresa[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<{ data: GetFuncionesPorUsuarioEmpresasResponse }>('/api/MOD06/empresas');
            setData(res.data?.funcionesPorUsuarioEmpresas ?? []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        data,
        loading,
        error,
        refetch,
    };
};
