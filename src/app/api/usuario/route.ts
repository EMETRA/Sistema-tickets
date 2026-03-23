import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import { GET_USER_QUERY, type GetUserResponse } from "@/api/graphql/home";

/**
 * GET /api/usuario
 *
 * Obtiene el perfil del usuario autenticado
 * Requiere: Authorization header con JWT token
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_USER_QUERY
        );

        const typedResult = result as unknown as GetUserResponse;

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
