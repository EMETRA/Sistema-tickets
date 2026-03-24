import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TEAM_MEMBERS_QUERY,
    type GetTeamMembersResponse,
} from '@/api/graphql/admin-dashboard';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_TEAM_MEMBERS_QUERY);
        const typedResult = result as unknown as GetTeamMembersResponse;
        return NextResponse.json(typedResult.teamMembers);
    } catch (error) {
        console.error('Error fetching team members:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team members' },
            { status: 500 }
        );
    }
}
