import { falloModulo } from "@/api/graphql/module-response";
/**
 * Route Handler: GET /api/MOD05/reporteRhCamposDisponibles
 *
 * Propósito: Obtener el catálogo de campos disponibles para el reporte RRHH.
 */

import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_RH_CAMPOS_DISPONIBLES_QUERY } from '@/api/graphql/MOD05';
import type { GetReporteRhCamposDisponiblesResponse } from '@/api/graphql/MOD05';

export async function GET() {
    try {
        const response = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTE_RH_CAMPOS_DISPONIBLES_QUERY,
            {},
        );

        const typedResponse = response as unknown as GetReporteRhCamposDisponiblesResponse;

        return NextResponse.json(
            {
                data: typedResponse.reporteRhCamposDisponibles,
            },
            { status: 200 },
        );
    } catch (error) { return falloModulo(error, "MOD05/reporteRhCamposDisponibles"); }
}
