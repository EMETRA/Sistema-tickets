import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_LAST_TICKET_QUERY,
    type GetLastTicketResponse,
} from '@/api/graphql/admin-dashboard';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_LAST_TICKET_QUERY);
        const typedResult = result as unknown as GetLastTicketResponse;
        return NextResponse.json(typedResult.lastTicket);
    } catch (error) {
        console.error('Error fetching last tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch last tickets' },
            { status: 500 }
        );
    }
}
