import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_CATEGORIES_QUERY,
    type GetCategoriesResponse,
} from '@/api/graphql/catalogs';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_CATEGORIES_QUERY);
        const typedResult = result as unknown as GetCategoriesResponse;
        return NextResponse.json(typedResult.ticketCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}
