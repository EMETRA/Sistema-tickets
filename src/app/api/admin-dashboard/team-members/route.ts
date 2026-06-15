import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_TEAM_MEMBERS_QUERY,
    type GetTeamMembersResponse,
} from '@/api/graphql/admin-dashboard';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const idDepartamentoParam = searchParams.get('id_departamento');
        const idRolParam = searchParams.get('id_rol');
        const searchParam = searchParams.get('search');
        const limitParam = searchParams.get('limit');

        const variables: {
            idDepartamento?: number;
            idRol?: number;
            search?: string;
            limit?: number;
        } = {};

        if (idDepartamentoParam) {
            const idDepartamento = parseInt(idDepartamentoParam, 10);
            if (!isNaN(idDepartamento)) {
                variables.idDepartamento = idDepartamento;
            }
        }

        if (idRolParam) {
            const idRol = parseInt(idRolParam, 10);
            if (!isNaN(idRol)) {
                variables.idRol = idRol;
            }
        }

        if (searchParam) {
            variables.search = searchParam;
        }

        if (limitParam) {
            const limit = parseInt(limitParam, 10);
            if (!isNaN(limit)) {
                variables.limit = limit;
            }
        }

        console.log("Fetching team members with variables:", variables);

        const result = await graphqlRequest(GET_TEAM_MEMBERS_QUERY, {
            variables: {
                idDepartamento: variables.idDepartamento,
                idRol: variables.idRol,
                search: variables.search,
                limit: variables.limit,
            }
        });
        console.log("GraphQL query result:", result);
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
