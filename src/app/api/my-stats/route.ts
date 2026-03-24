import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_MY_STATS_QUERY,
    type GetMyStatsResponse,
} from "@/api/graphql/home";

/**
 * GET /api/my-stats
 *
 * Obtiene las estadísticas del usuario autenticado
 * Incluye: tickets, vacaciones, zonas a cargo, gráfico mensual
 * Requiere: Authorization header con JWT token
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_MY_STATS_QUERY
        );

        const typedResult = result as unknown as GetMyStatsResponse;

        return NextResponse.json(typedResult);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        const statusCode =
      error instanceof Error && error.message.includes("401") ? 401 : 500;

        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
            },
            { status: statusCode }
        );
    }
}
