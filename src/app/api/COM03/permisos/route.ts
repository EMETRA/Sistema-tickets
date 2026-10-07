import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { estadoErrorGraphql } from '@/api/graphql/server-error';
import { GET_PERMISOS_NOTICIAS_QUERY, type GetPermisosNoticiasResponse } from '@/api/graphql/COM03';
export async function GET() {
    const headers = { 'Cache-Control': 'private, no-store' };
    try {
        const response = await graphqlRequest<GetPermisosNoticiasResponse>(GET_PERMISOS_NOTICIAS_QUERY);
        return NextResponse.json({ data: response.usuario?.permisos ?? [] }, { headers });
    } catch (error) {
        const status = estadoErrorGraphql(error);
        return NextResponse.json({ message: status === 401 ? 'Sesión expirada o credenciales inválidas' : 'No se pudieron consultar los permisos de noticias' }, { status, headers });
    }
}
