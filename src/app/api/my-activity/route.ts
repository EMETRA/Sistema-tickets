import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_MY_ACTIVITY_QUERY,
    type GetMyActivityResponse,
} from "@/api/graphql/technician";
import { falloInicio, headersInicio } from '@/api/graphql/home/server-response';

/**
 * GET /api/my-activity
 *
 * Obtiene la actividad reciente del técnico autenticado
 * Query params soportados:
 * - limit?: number (default 10)
 *
 * Ejemplo:
 * GET /api/my-activity?limit=20
 *
 * Requiere: Authorization header con JWT token
 */
export async function GET(request: NextRequest) {
    const rawLimit = request.nextUrl.searchParams.get('limit');
    const limit = rawLimit === null ? 10 : Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return NextResponse.json({ error: 'limit debe ser un entero entre 1 y 100' },
            { status: 400, headers: headersInicio });
    }
    try {
        const result = await graphqlRequest<GetMyActivityResponse>(
            GET_MY_ACTIVITY_QUERY, { variables: { limit } }
        );
        if (!Array.isArray(result?.myActivity)) throw new Error('RESPUESTA_INICIO_INCOMPLETA');
        return NextResponse.json(result, { headers: headersInicio });
    } catch (error) {
        return falloInicio(error, 'myActivity');
    }
}
