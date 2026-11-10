import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { queuePanelIncident } from '@/observability/server-incidents';
import {
    AppsCatalogError,
    getAppsCatalog,
} from "@/api/graphql/home/getAppsCatalog";
export const dynamic = "force-dynamic";

export async function GET() {
    const headers = { "Cache-Control": "private, no-store" };
    try {
        return NextResponse.json(
            { appsCatalog: await getAppsCatalog() },
            { headers },
        );
    } catch (error) {
        const status = error instanceof AppsCatalogError ? error.status : 503;
        const referencia = status >= 500 ? await queuePanelIncident('AppsCatalog',error,randomUUID()) : randomUUID();
        console.warn(
            JSON.stringify({
                codigo: "CATALOGO_APLICACIONES_FALLIDO",
                referencia,
                status,
            }),
        );
        return NextResponse.json(
            {
                codigo: "CATALOGO_APLICACIONES_FALLIDO",
                referencia,
                message:
                    status === 401
                        ? "Inicia sesión para consultar tus aplicaciones."
                        : "No se pudo cargar el catálogo de aplicaciones. Intenta nuevamente.",
            },
            { status, headers },
        );
    }
}
