'use client';

import { useCallback, useState } from 'react';
import { apiFetch } from '@/api/graphql/client';
import { downloadBase64File } from '@/helpers/downloadBase64File';
import type { VisaNominaExcelExport } from '@/api/graphql/MOD04';

interface VisaNominaExportFilters {
  empresa: string;
  tipoNomina: string;
  maestroNomina: string;
  tipoPago: string;
  unidadPresupuestaria: string;
}

interface UseGetVisaNominaExportExcelReturn {
  loading: boolean;
  error: Error | null;
  exportar: (filters: VisaNominaExportFilters) => Promise<VisaNominaExcelExport | null>;
}

export function useGetVisaNominaExportExcel(): UseGetVisaNominaExportExcelReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const exportar = useCallback(async (filters: VisaNominaExportFilters): Promise<VisaNominaExcelExport | null> => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('empresa', filters.empresa);
            params.set('tipoNomina', filters.tipoNomina);
            params.set('maestroNomina', filters.maestroNomina);
            params.set('tipoPago', filters.tipoPago);
            params.set('unidadPresupuestaria', filters.unidadPresupuestaria);

            const response = await apiFetch<{ data: VisaNominaExcelExport }>(
                `/api/MOD04/visaNominaExportExcel?${params.toString()}`,
            );

            const exportData = response.data;

            if (!exportData?.contentBase64 || !exportData.filename || !exportData.mimeType) {
                throw new Error('La respuesta del servidor no contiene los datos necesarios para descargar el archivo.');
            }

            downloadBase64File(exportData.contentBase64, exportData.filename, exportData.mimeType);
            return exportData;
        } catch (err) {
            const errorValue = err instanceof Error ? err : new Error(String(err));
            setError(errorValue);
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
