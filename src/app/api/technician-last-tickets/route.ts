import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_TECHNICIAN_LAST_TICKETS_QUERY,
    type GetTechnicianLastTicketsResponse,
} from "@/api/graphql/technician";

/**
 * GET /api/technician-last-tickets
 *
 * Obtiene los últimos tickets del técnico autenticado
 * Query params soportados:
 * - limit?: number (default 10)
 *
 * Ejemplo:
 * GET /api/technician-last-tickets?limit=20
 *
 * Requiere: Authorization header con JWT token
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TECHNICIAN_LAST_TICKETS_QUERY
        );

        const typedResult = result as unknown as GetTechnicianLastTicketsResponse;

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
