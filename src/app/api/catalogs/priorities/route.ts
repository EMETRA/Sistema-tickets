import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_PRIORITIES_QUERY,
    type GetPrioritiesResponse,
} from '@/api/graphql/catalogs';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_PRIORITIES_QUERY);
        const typedResult = result as unknown as GetPrioritiesResponse;
        return NextResponse.json(typedResult.ticketPriorities);
    } catch (error) {
        console.error('Error fetching priorities:', error);
        return NextResponse.json(
            { error: 'Failed to fetch priorities' },
            { status: 500 }
        );
    }
}
