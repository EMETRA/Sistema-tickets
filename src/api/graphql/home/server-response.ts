import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { estadoErrorGraphql } from '@/api/graphql/server-error';

export const headersInicio = { 'Cache-Control': 'private, no-store' };

export function falloInicio(error: unknown, operacion: 'myActivity' | 'myStats') {
    const referencia = randomUUID();
    const status = estadoErrorGraphql(error);
    const message = error instanceof Error ? error.message : '';
    console.error({
        evento: 'PANEL_INICIO_FALLIDO', operacion, referencia, status,
        codigosOracle: [...new Set(message.match(/ORA-\d{5}/g) || [])],
    });
    const detalle = operacion === 'myActivity' ? 'la actividad reciente' : 'el reporte de tickets';
    const errorPublico = status === 401 ? 'Tu sesión expiró. Inicia sesión nuevamente.'
        : status === 403 ? `No tienes permiso para consultar ${detalle}.`
            : `No se pudo consultar ${detalle}. Intenta nuevamente.`;
    return NextResponse.json({
        codigo: 'PANEL_INICIO_FALLIDO', referencia, error: errorPublico,
        timestamp: new Date().toISOString(),
    }, { status, headers: headersInicio });
}
