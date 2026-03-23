import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_PENDING_REQUESTS_QUERY,
    type GetPendingRequestsResponse,
} from '@/api/graphql/configuration';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_PENDING_REQUESTS_QUERY);
        const typedResult = result as unknown as GetPendingRequestsResponse;
        return NextResponse.json(typedResult.pendingRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pending requests' },
            { status: 500 }
        );
    }
}
