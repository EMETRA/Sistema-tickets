import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_PERFIL_EQUIPO_QUERY,
    type GetPerfilEquipoResponse,
} from "@/api/graphql/home";

/**
 * GET /api/perfil-equipo
 *
 * Obtiene el perfil del departamento/equipo del usuario autenticado
 * Requiere: Authorization header con JWT token
 */
export async function GET(request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_PERFIL_EQUIPO_QUERY
        );

        const typedResult = result as unknown as GetPerfilEquipoResponse;

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
