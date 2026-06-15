import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import { GET_USER_BY_ID_QUERY } from "@/api/graphql/home";

/**
 * GET /api/usuario/[userId]
 *
 * Obtiene el perfil de un usuario específico por su ID
 */
export async function GET(_request: NextRequest) {
    try {
        const url = new URL(_request.url);
        const userIdParam = url.pathname.split("/").pop();

        if (!userIdParam) {
            return NextResponse.json(
                { error: "Falta el parámetro userId", timestamp: new Date().toISOString() },
                { status: 400 }
            );
        }

        const userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
            return NextResponse.json(
                { error: "El parámetro userId debe ser un número", timestamp: new Date().toISOString() },
                { status: 400 }
            );
        }

        const result = await graphqlRequest(GET_USER_BY_ID_QUERY, {
            variables: { idUsuario: userId },
        });

        return NextResponse.json(result);
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
