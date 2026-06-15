import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_REPORTE_SEMANAL_EXCEL_QUERY,
    type GetReporteSemanalExcelResponse,
} from '@/api/graphql/MOD01';

/**
 * GET /api/MOD01/reporteSemanalExcel
 *
 * Query params:
 * - id: ID del reporte a exportar (requerido)
 *
 * Retorna:
 * - contentBase64: Archivo Excel codificado en base64
 * - filename: Nombre del archivo
 * - mimeType: Tipo MIME
 *
 * El cliente debe decodificar el base64 y descargar el archivo
 *
 * Ejemplo:
 * GET /api/MOD01/reporteSemanalExcel?id=123
 */
export async function GET(request: NextRequest) {
    try {
        // Extraer el ID del query param
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                {
                    error: 'ID del reporte es requerido',
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTE_SEMANAL_EXCEL_QUERY,
            {
                variables: { id },
            }
        );

        const typedResult = result as unknown as GetReporteSemanalExcelResponse;

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
