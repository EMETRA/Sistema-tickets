import { NextRequest, NextResponse } from "next/server";
import { getAppsCatalog } from "@/api/graphql/home/getAppsCatalog";

/**
 * GET /api/apps-catalog
 *
 * Árbol de aplicaciones del usuario autenticado.
 * El route handler resuelve la data en servidor (dummy hoy / GraphQL después).
 * Requiere: Authorization header con JWT (vía apiFetch desde el cliente).
 */
export async function GET(_request: NextRequest) {
    try {
        const appsCatalog = await getAppsCatalog();

        return NextResponse.json({ appsCatalog });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        const statusCode =
            error instanceof Error && error.message.includes("401") ? 401 : 500;

        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
            },
            { status: statusCode }
        );
    }
}
