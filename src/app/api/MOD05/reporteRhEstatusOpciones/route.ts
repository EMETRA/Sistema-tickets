/**
 * Route Handler: GET /api/MOD05/reporteRhEstatusOpciones
 *
 * Propósito: Obtener opciones de estatus para el reporte RRHH.
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_RH_ESTATUS_OPCIONES_QUERY } from '@/api/graphql/MOD05';
import type { GetReporteRhEstatusOpcionesResponse } from '@/api/graphql/MOD05';

export async function GET(request: NextRequest) {
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
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const timestamp = new Date().toISOString();

        if (message.includes('401') || message.includes('Unauthorized')) {
            return NextResponse.json(
                {
                    error: 'No autorizado',
                    message: 'Sesión expirada o credenciales inválidas',
                    timestamp,
                },
                { status: 401 },
            );
        }

        return NextResponse.json(
            {
                error: 'Error al obtener opciones de estatus',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
