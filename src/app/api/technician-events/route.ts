import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_TECHNICIAN_EVENTS_QUERY,
    type GetTechnicianEventsResponse,
} from "@/api/graphql/technician";

/**
 * GET /api/technician-events
 *
 * Obtiene eventos del técnico autenticado
 * Query params soportados:
 * - fecha_inicio?: string (YYYY-MM-DD)
 * - fecha_fin?: string (YYYY-MM-DD)
 *
 * Ejemplo:
 * GET /api/technician-events?fecha_inicio=2025-01-01&fecha_fin=2025-12-31
 *
 * Requiere: Authorization header con JWT token
 */
export async function GET(_request: NextRequest) {
    try {
        // Params fecha_inicio y fecha_fin opcionales
        const { searchParams } = new URL(_request.url);
        const fecha_inicio = searchParams.get("fecha_inicio") || undefined;
        const fecha_fin = searchParams.get("fecha_fin") || undefined;

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TECHNICIAN_EVENTS_QUERY,
            {
                variables: {
                    fecha_inicio,
                    fecha_fin,
                }
            }
        );

        const typedResult = result as unknown as GetTechnicianEventsResponse;

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
