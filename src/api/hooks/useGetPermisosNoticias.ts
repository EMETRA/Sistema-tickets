'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';

/**
 * Permisos de noticias del usuario de la sesión (api-tickets, `usuario { permisos }`).
 * `data` es null mientras carga o si la consulta falla: en ese caso la UI muestra todos los
 * botones, porque el backend vuelve a verificar cada operación (README "Noticias CMS", sección 2).
 */
export function useGetPermisosNoticias() {
    const [data, setData] = useState<string[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: string[] }>('/api/COM03/permisos');
            setData(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}
