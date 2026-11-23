import { falloModulo } from "@/api/graphql/module-response";
/**
 * Route Handler: GET /api/MOD05/reporteRhEstatusOpciones
 *
 * Propósito: Obtener opciones de estatus para el reporte RRHH.
 */

import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_RH_ESTATUS_OPCIONES_QUERY } from '@/api/graphql/MOD05';
import type { GetReporteRhEstatusOpcionesResponse } from '@/api/graphql/MOD05';

export async function GET() {
    try {
        const response = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTE_RH_ESTATUS_OPCIONES_QUERY,
            {},
        );

        const typedResponse = response as unknown as GetReporteRhEstatusOpcionesResponse;

        return NextResponse.json(
            {
                data: typedResponse.reporteRhEstatusOpciones,
            },
            { status: 200 },
        );
    } catch (error) { return falloModulo(error, "MOD05/reporteRhEstatusOpciones"); }
}
