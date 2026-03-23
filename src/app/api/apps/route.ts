import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_APPS_BY_ROLE_QUERY,
    type GetAppsByRoleResponse,
} from "@/api/graphql/home";

/**
 * GET /api/apps
 *
 * Obtiene las aplicaciones/módulos disponibles según el rol del usuario autenticado
 * Requiere: Authorization header con JWT token
 */
export async function GET(request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_APPS_BY_ROLE_QUERY
        );

        const typedResult = result as unknown as GetAppsByRoleResponse;

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
