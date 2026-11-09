import { falloModulo } from "@/api/graphql/module-response";
import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_REPORTE_SEMANAL_COLABORADORES_QUERY,
    type GetReporteSemanalColaboradoresResponse,
} from '@/api/graphql/MOD01';

/**
 * GET /api/MOD01/reporteSemanalColaboradores
 *
 * Retorna la lista de colaboradores disponibles para el formulario de reportes
 */
export async function GET() {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTE_SEMANAL_COLABORADORES_QUERY
        );
        
        const typed = result as unknown as GetReporteSemanalColaboradoresResponse;
        
        return NextResponse.json(typed);
    } catch (error) { return falloModulo(error, "MOD01/reporteSemanalColaboradores"); }
}
