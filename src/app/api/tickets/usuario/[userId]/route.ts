import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TICKETS_BY_USER_ID_QUERY,
    type GetTicketsResponse,
} from '@/api/graphql/tickets';

/**
 * GET /api/tickets/usuario/[userId]
 *
 * Ejemplo:
 * GET /api/tickets/usuario/123
 *
 * Descripción:
 * - Obtiene lista de tickets creados por un usuario específico
 * - Retorna todos los campos del ticket
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userIdParam = searchParams.get('userId');

        if (!userIdParam) {
            return NextResponse.json(
                { error: 'Falta el parámetro userId', timestamp: new Date().toISOString() },
                { status: 400 }
            );
        }

        const userId = parseInt(userIdParam, 10);
        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'El parámetro userId debe ser un número', timestamp: new Date().toISOString() },
                { status: 400 }
            );
        }

        const result = await graphqlRequest(GET_TICKETS_BY_USER_ID_QUERY, {
            variables: { idUsuario: userId },
        });

        const typedResult = result as unknown as GetTicketsResponse;

        return NextResponse.json(typedResult);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode =
            error instanceof Error && error.message.includes('401') ? 401 : 500;

        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
            },
            { status: statusCode }
        );
    }
}
