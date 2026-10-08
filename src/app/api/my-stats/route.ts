import { NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_MY_STATS_QUERY,
    type GetMyStatsResponse,
} from "@/api/graphql/home";
import { falloInicio, headersInicio } from '@/api/graphql/home/server-response';

/**
 * GET /api/my-stats
 *
 * Obtiene las estadísticas del usuario autenticado
 * Incluye: tickets, vacaciones, zonas a cargo, gráfico mensual
 * Requiere: Authorization header con JWT token
 */
export async function GET() {
    try {
        const result = await graphqlRequest<GetMyStatsResponse>(
            GET_MY_STATS_QUERY
        );
        if (!result?.myStats) throw new Error('RESPUESTA_INICIO_INCOMPLETA');
        return NextResponse.json(result, { headers: headersInicio });
    } catch (error) {
        return falloInicio(error, 'myStats');
    }
}
