'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import type {
    ConsultaVehiculoMuniInput,
    ConsultaVehiculoMuniResponse,
    VehiculoMuni,
} from '@/api/graphql/apps/types';
import { CONSULTA_VEHICULO_MUNI_QUERY } from '../graphql/apps/consultaVehiculoMuni';

export function useConsultaVehiculoMuni() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const consultarVehiculo = useCallback(
        async (input: ConsultaVehiculoMuniInput): Promise<VehiculoMuni> => {
            setLoading(true);
            setError(null);

            try {
                const result = await graphqlRequestClient<ConsultaVehiculoMuniResponse>(
                    CONSULTA_VEHICULO_MUNI_QUERY,
                    { variables: { input } }
                );
                setLoading(false);
                return result.consultaVehiculoMuni;
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setLoading(false);
                throw error;
            }
        },
        []
    );

    return { consultarVehiculo, loading, error };
}
