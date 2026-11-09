import { falloModulo } from "@/api/graphql/module-response";
import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_FUNCIONES_POR_USUARIO_APLICACIONES_QUERY } from '@/api/graphql/MOD06';
import type { GetFuncionesPorUsuarioAplicacionesResponse } from '@/api/graphql/MOD06';

export async function GET() {
    try {
        const response = await graphqlRequest<Record<string, unknown>>(
            GET_FUNCIONES_POR_USUARIO_APLICACIONES_QUERY,
        );

        const typedResponse = response as unknown as GetFuncionesPorUsuarioAplicacionesResponse;

        return NextResponse.json({ data: typedResponse.funcionesPorUsuarioAplicaciones }, { status: 200 });
    } catch (error: unknown) { return falloModulo(error, "MOD06/aplicaciones"); }
}
