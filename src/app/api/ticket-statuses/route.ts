import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TICKET_STATUSES_QUERY,
    type GetTicketStatusesResponse,
} from '@/api/graphql/tickets';

/**
 * GET /api/ticket-statuses
 *
 * Obtiene el catálogo completo de estados de tickets
 *
 * Ejemplo:
 * GET /api/ticket-statuses
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TICKET_STATUSES_QUERY
        );

        const typedResult = result as unknown as GetTicketStatusesResponse;

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
