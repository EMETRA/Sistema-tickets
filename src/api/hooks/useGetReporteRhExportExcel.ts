'use client';

import { useCallback, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import { downloadBase64File } from '@/helpers/downloadBase64File';
import type { ReporteRhExcelExport } from '@/api/graphql/MOD05';

interface ExportFilters {
  estatus: string;
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
  campos: string[];
}

interface UseGetReporteRhExportExcelReturn {
  loading: boolean;
  error: Error | null;
  exportar: (filters: ExportFilters) => Promise<ReporteRhExcelExport | null>;
}

export function useGetReporteRhExportExcel(): UseGetReporteRhExportExcelReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const exportar = useCallback(async (filters: ExportFilters): Promise<ReporteRhExcelExport | null> => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('estatus', filters.estatus);

            if (filters.fechaIngresoDesde) {
                params.set('fechaIngresoDesde', filters.fechaIngresoDesde);
            }

            if (filters.fechaIngresoHasta) {
                params.set('fechaIngresoHasta', filters.fechaIngresoHasta);
            }

            filters.campos.forEach((campo) => params.append('campos', campo));

            const response = await apiFetch<{ data: ReporteRhExcelExport }>(
                `/api/MOD05/reporteRhExportExcel?${params.toString()}`,
            );

            const exportData = response.data;

            if (!exportData?.contentBase64 || !exportData.filename || !exportData.mimeType) {
                throw new Error('La respuesta del servidor no contiene datos de exportación válidos.');
            }

            downloadBase64File(exportData.contentBase64, exportData.filename, exportData.mimeType);
            return exportData;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        exportar,
    };
}
