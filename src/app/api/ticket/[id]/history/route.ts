import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TICKET_HISTORY_QUERY,
    type GetTicketHistoryResponse,
} from '@/api/graphql/tickets';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/ticket/[id]/history
 *
 * Obtiene el historial de cambios de un ticket específico
 *
 * Ejemplo:
 * GET /api/ticket/1/history
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'ID de ticket requerido' },
                { status: 400 }
            );
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TICKET_HISTORY_QUERY,
            {
                variables: { ticketId: id },
            }
        );

        const typedResult = result as unknown as GetTicketHistoryResponse;

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
