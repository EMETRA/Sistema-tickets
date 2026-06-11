/**
 * Route Handler: GET /api/MOD08/reporteAnuladosExcel
 * 
 * Propósito: Exportar reportes anulados a Excel
 * 
 * Parámetros de query string requeridos:
 * - fechaInicio: string (YYYY-MM-DD)
 * - fechaFin: string (YYYY-MM-DD)
 * - tipoReporte: string (RECIBOS_PAGO | TICKET_PARQUEOS | PARALELO_FORMAS)
 * 
 * Validaciones:
 * - Todas las fechas son requeridas
 * - Formato debe ser YYYY-MM-DD
 * - Fechas deben ser válidas en el calendario
 * - fechaInicio <= fechaFin
 * - Requiere permisos financieros (Bearer)
 * - Registra en bitácora si está configurada
 * 
 * Respuesta exitosa (200):
 * {
 *   data: {
 *     filename: "recibos_pago_20260508_143522.xls",
 *     mimeType: "application/vnd.ms-excel",
 *     contentBase64: "...",
 *     totalFilas: 42,
 *     bitacoraId: 12345
 *   }
 * }
 * 
 * Nota: El frontend debe decodificar el base64 y descargar el archivo
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_ANULADOS_EXCEL_QUERY, TipoReporteAnulado, TipoReporteAnuladoEnum } from '@/api/graphql/MOD08';
import type { GetReporteAnuladosExcelResponse, ReporteAnuladosInput } from '@/api/graphql/MOD08';

/**
 * Valida el formato de una fecha YYYY-MM-DD
 */
function isValidDateFormat(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }

    // Validar que sea una fecha válida en el calendario
    const date = new Date(dateString);
    const timestamp = date.getTime();

    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
        return false;
    }

    const isoDate = date.toISOString().split('T')[0];
    return isoDate === dateString;
}

/**
 * Valida el tipo de reporte
 */
function isValidTipoReporte(tipo: string): tipo is TipoReporteAnulado {
    return Object.values(TipoReporteAnuladoEnum).includes(tipo as TipoReporteAnulado);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const fechaInicio = searchParams.get('fechaInicio');
        const fechaFin = searchParams.get('fechaFin');
        const tipoReporte = searchParams.get('tipoReporte');

        const timestamp = new Date().toISOString();

        // Validar parámetros requeridos
        if (!fechaInicio) {
            return NextResponse.json(
                {
                    error: 'Parámetro requerido ausente',
                    message: 'fechaInicio es requerido (formato: YYYY-MM-DD)',
                    timestamp,
                },
                { status: 400 },
            );
        }

        if (!fechaFin) {
            return NextResponse.json(
                {
                    error: 'Parámetro requerido ausente',
                    message: 'fechaFin es requerido (formato: YYYY-MM-DD)',
                    timestamp,
                },
                { status: 400 },
            );
        }

        if (!tipoReporte) {
            return NextResponse.json(
                {
                    error: 'Parámetro requerido ausente',
                    message: 'tipoReporte es requerido (RECIBOS_PAGO | TICKET_PARQUEOS | PARALELO_FORMAS)',
                    timestamp,
                },
                { status: 400 },
            );
        }

        // Validar formato de fechas
        if (!isValidDateFormat(fechaInicio)) {
            return NextResponse.json(
                {
                    error: 'Formato de fecha inválido',
                    message: `fechaInicio debe estar en formato YYYY-MM-DD (recibido: ${fechaInicio})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        if (!isValidDateFormat(fechaFin)) {
            return NextResponse.json(
                {
                    error: 'Formato de fecha inválido',
                    message: `fechaFin debe estar en formato YYYY-MM-DD (recibido: ${fechaFin})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        // Validar que fechaInicio <= fechaFin
        if (fechaInicio > fechaFin) {
            return NextResponse.json(
                {
                    error: 'Rango de fechas inválido',
                    message: `fechaInicio (${fechaInicio}) debe ser menor o igual a fechaFin (${fechaFin})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        // Validar tipo de reporte
        if (!isValidTipoReporte(tipoReporte)) {
            return NextResponse.json(
                {
                    error: 'Tipo de reporte inválido',
                    message: `tipoReporte debe ser uno de: RECIBOS_PAGO, TICKET_PARQUEOS, PARALELO_FORMAS (recibido: ${tipoReporte})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        // Construir input para GraphQL
        const input: ReporteAnuladosInput = {
            fechaInicio,
            fechaFin,
            tipoReporte: tipoReporte as TipoReporteAnulado,
        };

        const response = await graphqlRequest<{data: GetReporteAnuladosExcelResponse}>(
            GET_REPORTE_ANULADOS_EXCEL_QUERY,
            { 
                variables: { input },
            },
        );

        return NextResponse.json(
            {
                data: response.data.reporteAnuladosExportExcel,
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
                    message: 'Sesión expirada, credenciales inválidas o permisos insuficientes',
                    timestamp,
                },
                { status: 401 },
            );
        }

        return NextResponse.json(
            {
                error: 'Error al exportar reporte a Excel',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
