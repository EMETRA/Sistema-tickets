import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_FUNCIONES_POR_USUARIO_EMPRESAS_QUERY } from '@/api/graphql/MOD06';
import type { GetFuncionesPorUsuarioEmpresasResponse } from '@/api/graphql/MOD06';

export async function GET() {
    try {
        const response = await graphqlRequest<Record<string, unknown>>(
            GET_FUNCIONES_POR_USUARIO_EMPRESAS_QUERY,
        );

        const typedResponse = response as unknown as GetFuncionesPorUsuarioEmpresasResponse;

        return NextResponse.json({ data: typedResponse.funcionesPorUsuarioEmpresas }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const timestamp = new Date().toISOString();

        if (message.includes('401') || message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'No autorizado', message: 'Sesión expirada o credenciales inválidas', timestamp },
                { status: 401 },
            );
        }

        return NextResponse.json({ error: 'Error al obtener empresas', message, timestamp }, { status: 500 });
    }
}
