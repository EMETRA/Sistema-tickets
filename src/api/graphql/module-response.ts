import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { diagnosticoErrorGraphql, estadoErrorGraphql } from "./server-error";
import { queuePanelIncident } from '@/observability/server-incidents';

/** Error público de los módulos: conserva sesión/permisos y un diagnóstico correlacionable. */
export async function falloModulo(error: unknown, operacion: string) {
    const referencia = await queuePanelIncident(operacion, error, randomUUID());
    const status = estadoErrorGraphql(error);
    console.error({ evento: "PANEL_MODULO_FALLIDO", operacion, referencia, status, ...diagnosticoErrorGraphql(error) });
    const message = status === 401 ? "Tu sesión expiró. Inicia sesión nuevamente."
        : status === 403 ? "No tienes permisos para realizar esta operación."
            : "No se pudo completar la consulta. Conserva los datos y reintenta.";
    return NextResponse.json({ codigo: "PANEL_MODULO_FALLIDO", message, referencia }, { status, headers: { "Cache-Control": "private, no-store" } });
}
