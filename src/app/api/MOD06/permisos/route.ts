import { falloModulo } from "@/api/graphql/module-response";
import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_FUNCIONES_POR_USUARIO_PERMISOS_QUERY } from '@/api/graphql/MOD06';
import type { GetFuncionesPorUsuarioPermisosResponse, FuncionesPorUsuarioConsultaInput } from '@/api/graphql/MOD06';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body?.empresa || !body?.asignaUsuario || !body?.aplicacion) {
            const timestamp = new Date().toISOString();
            return NextResponse.json({ error: 'Missing parameters', message: 'empresa, asignaUsuario y aplicacion son requeridos', timestamp }, { status: 400 });
        }

        const input: FuncionesPorUsuarioConsultaInput = {
            empresa: String(body.empresa),
            asignaUsuario: String(body.asignaUsuario),
            aplicacion: String(body.aplicacion),
        };

        const response = await graphqlRequest<Record<string, unknown>>(
            GET_FUNCIONES_POR_USUARIO_PERMISOS_QUERY,
            {
                variables: { input },
            },
        );

        const typedResponse = response as unknown as GetFuncionesPorUsuarioPermisosResponse;

        return NextResponse.json({ data: typedResponse.funcionesPorUsuarioPermisos }, { status: 200 });
    } catch (error: unknown) { return falloModulo(error, "MOD06/permisos"); }
}
