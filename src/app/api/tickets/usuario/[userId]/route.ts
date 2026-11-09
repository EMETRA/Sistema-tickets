import { NextRequest, NextResponse } from "next/server";
import { ErrorHandler } from "@/api/graphql/errors";
import { graphqlRequest } from "@/api/graphql/client";
import { GET_TICKETS_BY_USER_ID_QUERY, type Ticket } from "@/api/graphql/tickets";

export async function GET(_request: NextRequest, context: { params: Promise<{ userId: string }> }) {
    const { userId: raw } = await context.params;
    const userId = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(userId) || userId <= 0) {
        return NextResponse.json({ error: "El usuario no es válido." }, { status: 400 });
    }
    try {
        const result = await graphqlRequest<{ ticketsByUsuarioCreador: Ticket[] }>(GET_TICKETS_BY_USER_ID_QUERY, { variables: { idUsuario: userId } });
        if (!Array.isArray(result.ticketsByUsuarioCreador)) throw new Error("Respuesta incompleta");
        return NextResponse.json({ tickets: result.ticketsByUsuarioCreador }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        return NextResponse.json({ error: "No se pudieron cargar las solicitudes del usuario." }, { status: ErrorHandler.isAuthError(error) ? 401 : 503 });
    }
}
