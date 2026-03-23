import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_LAST_MOVEMENTS_QUERY,
    type GetLastMovementsResponse,
} from '@/api/graphql/admin-dashboard';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_LAST_MOVEMENTS_QUERY);
        const typedResult = result as unknown as GetLastMovementsResponse;
        return NextResponse.json(typedResult.lastMovements);
    } catch (error) {
        console.error('Error fetching last movements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch last movements' },
            { status: 500 }
        );
    }
}
