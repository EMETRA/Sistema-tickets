/**
 * Hook para obtener tipos de reportes de anulados
 *
 * Comportamiento:
 * - Auto-fetch en el montaje del componente
 * - Retorna: [data, loading, error, refetch]
 * - Sin parámetros
 *
 * Uso:
 * const [tipos, loading, error, refetch] = useGetReporteAnuladosTipos();
 * 
 * // Usar en un select
 * {tipos.map(tipo => <option key={tipo.codigo} value={tipo.codigo}>{tipo.etiqueta}</option>)}
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ReporteAnuladoTipoInfo } from '@/api/graphql/MOD08';

interface UseGetReporteAnuladosTiposReturn {
  data: ReporteAnuladoTipoInfo[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useGetReporteAnuladosTipos(): UseGetReporteAnuladosTiposReturn {
    const [data, setData] = useState<ReporteAnuladoTipoInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/MOD08/reporteAnuladosTipos', {
                method: 'GET',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const result = await response.json();
            setData(result.data);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Error desconocido');
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

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
