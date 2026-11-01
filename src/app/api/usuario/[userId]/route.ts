import { NextRequest, NextResponse } from "next/server";
import { ErrorHandler } from "@/api/graphql/errors";
import { graphqlRequest } from "@/api/graphql/client";
import { GET_USER_BY_ID_QUERY, type UsuarioPerfil } from "@/api/graphql/home";

export async function GET(_request: NextRequest, context: { params: Promise<{ userId: string }> }) {
    const { userId: raw } = await context.params;
    const userId = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(userId) || userId <= 0) {
        return NextResponse.json({ error: "El usuario no es válido." }, { status: 400 });
    }
    try {
        const result = await graphqlRequest<{ usuarioById: UsuarioPerfil | null }>(GET_USER_BY_ID_QUERY, { variables: { idUsuario: userId } });
        if (!result.usuarioById) return NextResponse.json({ error: "No se encontró el perfil." }, { status: 404 });
        return NextResponse.json({ usuario: result.usuarioById }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        return NextResponse.json({ error: "No se pudo cargar el perfil." }, { status: ErrorHandler.isAuthError(error) ? 401 : 503 });
    }
}
