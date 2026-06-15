/**
 * Hook para exportar reportes anulados a Excel
 *
 * Comportamiento:
 * - NO auto-fetch (patrón manual)
 * - Retorna función `exportar(input)` para llamar a demanda
 * - Maneja la descarga del archivo desde base64
 * - Retorna: { exportar, loading, error }
 *
 * Uso:
 * const { exportar, loading, error } = useGetReporteAnuladosExcel();
 * 
 * const handleExport = async () => {
 *   await exportar({
 *     fechaInicio: "2026-05-01",
 *     fechaFin: "2026-05-29",
 *     tipoReporte: "RECIBOS_PAGO"
 *   });
 * };
 * 
 * <button onClick={handleExport} disabled={loading}>
 *   {loading ? 'Exportando...' : 'Descargar Excel'}
 * </button>
 * {error && <p style={{ color: 'red' }}>{error.message}</p>}
 */

'use client';

import { useCallback, useState } from 'react';
import { downloadBase64File } from '@/helpers/downloadBase64File';
import type { ReporteAnuladosInput } from '@/api/graphql/MOD08';

interface UseGetReporteAnuladosExcelReturn {
  exportar: (input: ReporteAnuladosInput) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

export function useGetReporteAnuladosExcel(): UseGetReporteAnuladosExcelReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const exportar = useCallback(
        async (input: ReporteAnuladosInput) => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams();
                params.set('fechaInicio', input.fechaInicio);
                params.set('fechaFin', input.fechaFin);
                params.set('tipoReporte', input.tipoReporte);

                const response = await fetch(`/api/MOD08/reporteAnuladosExcel?${params.toString()}`, {
                    method: 'GET',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error ${response.status}`);
                }

                const result = await response.json();
                const exportData = result.data;

                if (!exportData?.contentBase64 || !exportData?.filename || !exportData?.mimeType) {
                    throw new Error('La respuesta del servidor no contiene datos válidos para la exportación.');
                }

                downloadBase64File(exportData.contentBase64, exportData.filename, exportData.mimeType);
                return true;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Error desconocido');
                setError(error);
                return false;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        exportar,
        loading,
        error,
    };
}
