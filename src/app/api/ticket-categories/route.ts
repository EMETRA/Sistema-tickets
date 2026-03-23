import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TICKET_CATEGORIES_QUERY,
    type GetTicketCategoriesResponse,
} from '@/api/graphql/tickets';

/**
 * GET /api/ticket-categories
 *
 * Obtiene el catálogo completo de categorías de tickets
 *
 * Ejemplo:
 * GET /api/ticket-categories
 */
export async function GET() {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TICKET_CATEGORIES_QUERY
        );

        const typedResult = result as unknown as GetTicketCategoriesResponse;

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
