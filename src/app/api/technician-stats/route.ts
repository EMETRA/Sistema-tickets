import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_TECHNICIAN_STATS_QUERY,
    type GetTechnicianStatsResponse,
} from "@/api/graphql/technician";

/**
 * GET /api/technician-stats
 *
 * Obtiene estadísticas de desempeño del técnico autenticado
 * Incluye: tickets, asignados, resueltos, pendientes, gráfico rendimiento
 * Query params soportados:
 * - rango?: string ("anio" | "meses" | "semana")
 *
 * Ejemplo:
 * GET /api/technician-stats?rango=anio
 *
 * Requiere: Authorization header con JWT token
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TECHNICIAN_STATS_QUERY
        );

        const typedResult = result as unknown as GetTechnicianStatsResponse;

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
