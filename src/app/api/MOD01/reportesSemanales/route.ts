import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_REPORTES_SEMANALES_QUERY,
    type GetReportesSemanalesResponse,
    type ReporteSemanalFilterInput,
} from '@/api/graphql/MOD01';

/**
 * GET /api/MOD01/reportesSemanales
 *
 * Query params soportados:
 * - idColaborador?: number
 * - proyecto?: string
 * - fechaDesde?: string (ISO format)
 * - fechaHasta?: string (ISO format)
 * - limit?: number (default 50)
 *
 * Ejemplo:
 * GET /api/MOD01/reportesSemanales?idColaborador=5&proyecto=ProyectoX&limit=20
 */
export async function GET(request: NextRequest) {
    try {
        // Extraer query params
        const searchParams = request.nextUrl.searchParams;

        // Construir objeto de filtros
        const filters: ReporteSemanalFilterInput = {};

        // Campos numéricos
        const idColaborador = searchParams.get('idColaborador');
        if (idColaborador) {
            const numValue = parseInt(idColaborador, 10);
            if (!isNaN(numValue)) {
                filters.idColaborador = numValue;
            }
        }

        // Campos string
        const proyecto = searchParams.get('proyecto');
        if (proyecto) {
            filters.proyecto = proyecto;
        }

        const fechaDesde = searchParams.get('fechaDesde');
        if (fechaDesde) {
            filters.fechaDesde = fechaDesde;
        }

        const fechaHasta = searchParams.get('fechaHasta');
        if (fechaHasta) {
            filters.fechaHasta = fechaHasta;
        }

        // Limit con default
        const limit = searchParams.get('limit');
        if (limit) {
            const numValue = parseInt(limit, 10);
            if (!isNaN(numValue)) {
                filters.limit = numValue;
            }
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTES_SEMANALES_QUERY,
            {
                variables: {
                    filters: Object.keys(filters).length > 0 ? filters : undefined,
                },
            }
        );

        const typedResult = result as unknown as GetReportesSemanalesResponse;

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
