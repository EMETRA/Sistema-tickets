'use client';

import { useState, useCallback } from 'react';
import { apiFetch } from '@/api/graphql/client';
import type { ReporteSemanalExcelExport } from '@/api/graphql/MOD01';

/**
 * Hook useGetReporteSemanalExcel
 * 
 * Exporta un reporte semanal a Excel (base64)
 * 
 * Este hook NO hace auto-fetch. Debes llamar manualmente a la función exportar()
 * 
 * @returns { data, loading, error, exportar }
 * 
 * Ejemplo:
 * ```ts
 * const { data, loading, exportar } = useGetReporteSemanalExcel();
 * 
 * const handleExport = async () => {
 *   const result = await exportar('123');
 *   if (result) {
 *     // Decodificar y descargar
 *     const blob = new Blob([Buffer.from(result.contentBase64, 'base64')], {
 *       type: result.mimeType,
 *     });
 *     const url = URL.createObjectURL(blob);
 *     const a = document.createElement('a');
 *     a.href = url;
 *     a.download = result.filename;
 *     a.click();
 *   }
 * };
 * ```
 */
export function useGetReporteSemanalExcel() {
    const [data, setData] = useState<ReporteSemanalExcelExport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const exportar = useCallback(async (id: string): Promise<ReporteSemanalExcelExport | null> => {
        if (!id) {
            setError(new Error('ID del reporte es requerido'));
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ reporteSemanalExportExcel: ReporteSemanalExcelExport }>(
                `/api/MOD01/reporteSemanalExcel?id=${encodeURIComponent(id)}`
            );

            const excelData = response.reporteSemanalExportExcel || null;
            setData(excelData);
            return excelData;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setData(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, exportar };
}
