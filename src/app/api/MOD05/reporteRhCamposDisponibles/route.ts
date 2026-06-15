/**
 * Route Handler: GET /api/MOD05/reporteRhCamposDisponibles
 *
 * Propósito: Obtener el catálogo de campos disponibles para el reporte RRHH.
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_RH_CAMPOS_DISPONIBLES_QUERY } from '@/api/graphql/MOD05';
import type { GetReporteRhCamposDisponiblesResponse } from '@/api/graphql/MOD05';

export async function GET(request: NextRequest) {
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
                error: 'Error al obtener campos disponibles',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
