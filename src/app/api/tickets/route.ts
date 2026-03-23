import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TICKETS_QUERY,
    type GetTicketsResponse,
    type TicketFilterInput,
} from '@/api/graphql/tickets';

/**
 * GET /api/tickets
 *
 * Query params soportados:
 * - categoriaId?: string
 * - estadoId?: string
 * - prioridadId?: string
 * - usuarioAsignadoId?: string
 *
 * Ejemplo:
 * GET /api/tickets?estadoId=1&prioridadId=2
 */
export async function GET(request: NextRequest) {
    try {
        // Extraer query params
        const searchParams = request.nextUrl.searchParams;

        // Construir objeto de filtros a partir de query params
        const filters: TicketFilterInput = {};

        // Campos que deben ser convertidos a números
        const numericFields = new Set([
            'estadoId',
            'usuarioAsignadoId',
            'categoriaId',
            'prioridadId',
        ]);

        const filterKeys: (keyof TicketFilterInput)[] = [
            'categoriaId',
            'estadoId',
            'prioridadId',
            'usuarioAsignadoId',
        ];

        for (const key of filterKeys) {
            const value = searchParams.get(key);
            if (value) {
                if (numericFields.has(key)) {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                        filters[key] = numValue as never;
                    }
                } else {
                    filters[key] = value as never;
                }
            }
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_TICKETS_QUERY,
            {
                variables: {
                    filters: Object.keys(filters).length > 0 ? filters : undefined,
                },
            }
        );

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
