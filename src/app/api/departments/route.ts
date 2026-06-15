// src/app/api/departments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_DEPARTMENTS_QUERY, type GetDepartmentsResponse } from '@/api/graphql/departments';

/**
 * GET /api/departments
 *
 * Devuelve la lista de departamentos del sistema
 */
export async function GET(_request: NextRequest) {
    try {
        const result = await graphqlRequest<Record<string, unknown>>(GET_DEPARTMENTS_QUERY);
        const typed = result as unknown as GetDepartmentsResponse;
        return NextResponse.json(typed);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const statusCode = error instanceof Error && error.message.includes('401') ? 401 : 500;
        return NextResponse.json({ error: message, timestamp: new Date().toISOString() }, { status: statusCode });
    }
}