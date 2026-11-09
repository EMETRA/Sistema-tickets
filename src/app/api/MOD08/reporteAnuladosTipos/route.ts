import { falloModulo } from "@/api/graphql/module-response";
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

import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_REPORTE_ANULADOS_TIPOS_QUERY } from '@/api/graphql/MOD08';
import type { GetReporteAnuladosTiposResponse } from '@/api/graphql/MOD08';

export async function GET() {
    try {
        const response = await graphqlRequest<GetReporteAnuladosTiposResponse>(
            GET_REPORTE_ANULADOS_TIPOS_QUERY,
            {},
        );

        return NextResponse.json(
            {
                data: response.reporteAnuladosTipos,
            },
            { status: 200 },
        );
    } catch (error) { return falloModulo(error, "MOD08/reporteAnuladosTipos"); }
}
