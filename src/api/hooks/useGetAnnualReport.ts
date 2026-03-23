'use client';

/**
 * Hook useGetAnnualReport
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/annual-report?anio=...')
 * 2. Route handler ejecuta GET_ANNUAL_REPORT_QUERY en servidor (con variable anio)
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { type AnnualReport } from "@/api/graphql/technician";

interface AnnualReportFilters {
    anio: number;
}

/**
 * Hook para obtener el reporte anual del técnico
 * @param filters.anio Año del reporte (REQUERIDO)
 * @returns { data, loading, error, refetch }
 */
export function useGetAnnualReport(filters: AnnualReportFilters) {
    const [data, setData] = useState<AnnualReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            if (!filters.anio) {
                throw new Error("Parámetro 'anio' es requerido");
            }

            const url = `/api/annual-report?anio=${filters.anio}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.annualReport || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        refetch,
    };
}
