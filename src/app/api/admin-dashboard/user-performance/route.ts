import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_USER_PERFORMANCE_QUERY,
    type GetUserPerformanceResponse,
} from '@/api/graphql/admin-dashboard';

import type { UserPerformanceFilters } from '@/api/graphql/admin-dashboard/types';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const fecha_inicio = searchParams.get('fecha_inicio') || undefined;
        const fecha_fin = searchParams.get('fecha_fin') || undefined;
        const id_departamento = searchParams.get('id_departamento')
            ? parseInt(searchParams.get('id_departamento')!, 10)
            : undefined;
        const id_usuario = searchParams.get('id_usuario')
            ? parseInt(searchParams.get('id_usuario')!, 10)
            : undefined;
        const periodo = searchParams.get('periodo') as UserPerformanceFilters['periodo'];

        const variables = {
            fecha_inicio,
            fecha_fin,
            id_departamento,
            id_usuario,
            periodo,
        };

        console.log('Fetching user performance with variables:', variables);

        const result = await graphqlRequest(GET_USER_PERFORMANCE_QUERY, { variables });
        const typedResult = result as unknown as GetUserPerformanceResponse;
        return NextResponse.json(typedResult.userPerformance);
    } catch (error) {
        console.error('Error fetching user performance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user performance' },
            { status: 500 }
        );
    }
}
