import { useState } from "react";
import { GuardarReporteSemanalInput, GuardarReporteSemanalResponse } from "../graphql/apps/types";
import { graphqlRequestClient } from "../graphql/client";
import { GUARDAR_REPORTE_SEMANAL } from "../graphql/apps/saveWeeklyReport";

export const useGuardarReporteSemanal = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<GuardarReporteSemanalResponse | null>(null);

    const guardarReporte = async (input: GuardarReporteSemanalInput) => {
        setLoading(true);
        setError(null);
        try {
            const response = await graphqlRequestClient<{guardarReporteSemanal: GuardarReporteSemanalResponse;}>(GUARDAR_REPORTE_SEMANAL, { variables: { input } });
            setData(response.guardarReporteSemanal);
            return response.guardarReporteSemanal;
        } catch (err) {
            const e = err as Error;
            setError(e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { guardarReporte, loading, error, data };
};