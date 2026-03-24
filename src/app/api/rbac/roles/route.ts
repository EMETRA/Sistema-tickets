import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_ROLES_QUERY,
    type GetRolesResponse,
} from '@/api/graphql/rbac';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_ROLES_QUERY);
        const typedResult = result as unknown as GetRolesResponse;
        return NextResponse.json(typedResult.roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch roles' },
            { status: 500 }
        );
    }
}
