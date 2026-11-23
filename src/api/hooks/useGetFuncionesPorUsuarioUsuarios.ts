import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { FuncionesPorUsuarioUsuario } from '@/api/graphql/MOD06';

export const useGetFuncionesPorUsuarioUsuarios = () => {
    const [data, setData] = useState<FuncionesPorUsuarioUsuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch<{ data: FuncionesPorUsuarioUsuario[] }>('/api/MOD06/usuarios');
            setData(res.data ?? []);
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
