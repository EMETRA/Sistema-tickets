import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_USERS_QUERY, type GetUsersResponse } from '@/api/graphql/users';

/**
 * GET /api/users
 *
 * Devuelve la lista de usuarios
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(GET_USERS_QUERY);
        const typed = result as unknown as GetUsersResponse;
        return NextResponse.json(typed);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = error instanceof Error && error.message.includes('401') ? 401 : 500;
        return NextResponse.json({ error: message, timestamp: new Date().toISOString() }, { status: statusCode });
    }
}
