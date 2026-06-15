import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_REPORTE_SEMANAL_SEGUIMIENTO_QUERY,
    type GetReporteSemanalSeguimientoResponse,
} from '@/api/graphql/MOD01';

/**
 * GET /api/MOD01/reporteSemanalSeguimiento
 *
 * Query params:
 * - idColaborador: ID del colaborador (requerido, número)
 * - limit?: Cantidad máxima de reportes (opcional, número)
 *
 * Retorna el seguimiento histórico del colaborador
 *
 * Ejemplo:
 * GET /api/MOD01/reporteSemanalSeguimiento?idColaborador=5&limit=10
 */
export async function GET(request: NextRequest) {
    try {
        // Extraer query params
        const searchParams = request.nextUrl.searchParams;
        const idColaboradorStr = searchParams.get('idColaborador');

        if (!idColaboradorStr) {
            return NextResponse.json(
                {
                    error: 'ID del colaborador es requerido',
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        const idColaborador = parseInt(idColaboradorStr, 10);
        if (isNaN(idColaborador)) {
            return NextResponse.json(
                {
                    error: 'ID del colaborador debe ser un número válido',
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        // Limit es opcional
        let limit: number | undefined;
        const limitStr = searchParams.get('limit');
        if (limitStr) {
            const numValue = parseInt(limitStr, 10);
            if (!isNaN(numValue)) {
                limit = numValue;
            }
        }

        const variables: Record<string, unknown> = { idColaborador };
        if (limit !== undefined) {
            variables.limit = limit;
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTE_SEMANAL_SEGUIMIENTO_QUERY,
            {
                variables,
            }
        );

        const typedResult = result as unknown as GetReporteSemanalSeguimientoResponse;

        return NextResponse.json(typedResult);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = error instanceof Error && error.message.includes('401') ? 401 : 500;

        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
            },
            { status: statusCode }
        );
    }
}
