'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { EstadoNotificacion, EstadoNotificacionNoticia } from '@/api/graphql/COM03';

interface UseGetEstadosNotificacionReturn {
  /** noticiaId → estado de la push; las que no aparecen no tienen notificación */
  data: Record<string, EstadoNotificacion>;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Obtiene el estado de la notificación push (API de VIVI) de las noticias indicadas (COM03).
 * Se consulta aparte del listado: si VIVI falla, el listado se sigue mostrando.
 */
export function useGetEstadosNotificacion(noticiaIds: string[]): UseGetEstadosNotificacionReturn {
    const [data, setData] = useState<Record<string, EstadoNotificacion>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    // Clave estable para no repetir la consulta si el arreglo cambia de referencia pero no de contenido.
    const idsKey = noticiaIds.join(',');

    const fetchData = useCallback(async () => {
        if (!idsKey) {
            setData({});
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ data: EstadoNotificacionNoticia[] }>(
                `/api/COM03/notificaciones?ids=${encodeURIComponent(idsKey)}`
            );
            setData(Object.fromEntries((response.data ?? []).map((item) => [item.noticiaId, item.estado])));
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData({});
        } finally {
            setLoading(false);
        }
    }, [idsKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}
