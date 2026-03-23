import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_ADMIN_DASHBOARD_STATS_QUERY,
    type GetAdminDashboardStatsResponse,
} from '@/api/graphql/admin-dashboard';

export async function GET() {
    try {
        const result = await graphqlRequest(GET_ADMIN_DASHBOARD_STATS_QUERY);
        const typedResult = result as unknown as GetAdminDashboardStatsResponse;
        return NextResponse.json(typedResult.adminDashboardStats);
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin dashboard stats' },
            { status: 500 }
        );
    }
}
