import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_STATUSES_QUERY,
    type GetStatusesResponse,
} from '@/api/graphql/catalogs';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_STATUSES_QUERY);
        const typedResult = result as unknown as GetStatusesResponse;
        return NextResponse.json(typedResult.ticketStatuses);
    } catch (error) {
        console.error('Error fetching statuses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statuses' },
            { status: 500 }
        );
    }
}
