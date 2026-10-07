import { NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import { GET_USER_QUERY, type GetUserResponse } from "@/api/graphql/home";
import { estadoErrorGraphql } from '@/api/graphql/server-error';
export async function GET() {
    const headers = { 'Cache-Control': 'private, no-store' };
    try {
        const result = await graphqlRequest<GetUserResponse>(GET_USER_QUERY);
        return NextResponse.json(result, { headers });
    } catch (error) {
        const status = estadoErrorGraphql(error);
        const message = error instanceof Error ? error.message : '';
        console.error({ evento: 'PANEL_PERFIL_FALLIDO', status, codigosOracle: [...new Set(message.match(/ORA-\d{5}/g) || [])] });
        return NextResponse.json({ error: status === 401 ? 'Sesión expirada o credenciales inválidas' : status === 403 ? 'No tienes permiso para consultar el perfil' : 'No se pudo consultar el perfil en api-tickets', timestamp: new Date().toISOString() }, { status, headers });
    }
}
