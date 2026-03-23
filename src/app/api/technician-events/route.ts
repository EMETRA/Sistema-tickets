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
        // Por ahora, ejecutamos la query sin filtros en el lado GraphQL
        // Los filtros (fecha_inicio, fecha_fin) están disponibles en query params
        // pero al no soportar variables en nuestra query simple, se pueden manejar
        // en el backend o agregarse como parámetros GraphQL si se requiere

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TECHNICIAN_EVENTS_QUERY
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
