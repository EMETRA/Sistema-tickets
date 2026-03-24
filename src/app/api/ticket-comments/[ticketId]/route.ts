import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TICKET_COMMENTS_QUERY,
    type GetTicketCommentsResponse,
} from '@/api/graphql/tickets';

interface RouteParams {
    params: Promise<{
        ticketId: string;
    }>;
}

/**
 * GET /api/ticket-comments/[ticketId]
 *
 * Obtiene todos los comentarios de un ticket
 *
 * Ejemplo:
 * GET /api/ticket-comments/1
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { ticketId } = await params;

        if (!ticketId) {
            return NextResponse.json(
                { error: 'ID de ticket requerido' },
                { status: 400 }
            );
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TICKET_COMMENTS_QUERY,
            {
                variables: { ticketId },
            }
        );

        const typedResult = result as unknown as GetTicketCommentsResponse;

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
