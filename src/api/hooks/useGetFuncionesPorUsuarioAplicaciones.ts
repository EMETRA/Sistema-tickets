import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { FuncionesPorUsuarioAplicacion, GetFuncionesPorUsuarioAplicacionesResponse } from '@/api/graphql/MOD06';

export const useGetFuncionesPorUsuarioAplicaciones = () => {
    const [data, setData] = useState<FuncionesPorUsuarioAplicacion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<{ data: GetFuncionesPorUsuarioAplicacionesResponse }>('/api/MOD06/aplicaciones');
            setData(res.data?.funcionesPorUsuarioAplicaciones ?? []);
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
