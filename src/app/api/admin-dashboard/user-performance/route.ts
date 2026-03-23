import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_USER_PERFORMANCE_QUERY,
    type GetUserPerformanceResponse,
} from '@/api/graphql/admin-dashboard';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_USER_PERFORMANCE_QUERY);
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
