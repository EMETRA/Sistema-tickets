/**
 * Route Handler: GET /api/MOD08/reporteAnuladosTipos
 * 
 * Propósito: Obtener catálogo de tipos de reportes de anulados
 * Uso: Poblar select en formulario de reportes anulados
 * 
 * Parámetros: Ninguno
 * 
 * Respuesta exitosa (200):
 * {
 *   data: [
 *     { codigo: "RECIBOS_PAGO", etiqueta: "Recibos de Pago" },
 *     { codigo: "TICKET_PARQUEOS", etiqueta: "Tickets de Parqueo" },
 *     { codigo: "PARALELO_FORMAS", etiqueta: "Paralelo de Formas" }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_ANULADOS_TIPOS_QUERY } from '@/api/graphql/MOD08';
import type { GetReporteAnuladosTiposResponse } from '@/api/graphql/MOD08';

export async function GET(request: NextRequest) {
    try {
        const response = await graphqlRequest<{data: GetReporteAnuladosTiposResponse}>(
            GET_REPORTE_ANULADOS_TIPOS_QUERY,
            {},
        );

        return NextResponse.json(
            {
                data: response.data.reporteAnuladosTipos,
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
                error: 'Error al obtener tipos de reportes',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
