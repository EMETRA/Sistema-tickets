/**
 * Route Handler: GET /api/COM03/notificaciones
 *
 * Propósito: Obtener el estado de la notificación push de varias noticias desde la API de VIVI.
 * Va del lado del servidor para que cualquier credencial de VIVI no llegue al navegador.
 *
 * Query params:
 * - ids: string (ids de noticias separados por coma), p. ej. "1,2,3"
 *
 * Respuesta exitosa (200):
 * {
 *   data: [ { noticiaId, estado } ]   // las noticias sin notificación no aparecen
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { NOTIFICACIONES_DUMMY } from '@/api/graphql/COM03';
import type { EstadoNotificacionNoticia } from '@/api/graphql/COM03';

/**
 * TODO [COM03-BACKEND]: integración con la API de VIVI (aún no se conoce su contrato).
 * Cuando se defina:
 * 1. Configurar VIVI_API_URL (y, si aplica, credenciales) en el entorno del servidor (.env.example).
 * 2. Implementar la llamada y mapear la respuesta de VIVI a EstadoNotificacionNoticia[]
 *    (los valores de VIVI → EstadoNotificacion: ENVIADO / PENDIENTE / ERROR).
 * 3. Si backend expone estos estados desde api-tickets (GraphQL), usar graphqlRequest en su lugar.
 * Mientras VIVI_API_URL no esté configurada, se responden datos dummy.
 */
async function fetchEstadosDesdeVivi(ids: string[]): Promise<EstadoNotificacionNoticia[]> {
    const viviApiUrl = process.env.VIVI_API_URL;

    if (!viviApiUrl) {
        return NOTIFICACIONES_DUMMY.filter((notificacion) => ids.includes(notificacion.noticiaId));
    }

    throw new Error('Integración con VIVI pendiente: falta implementar la llamada a VIVI_API_URL');
}

export async function GET(request: NextRequest) {
    try {
        const ids = (request.nextUrl.searchParams.get('ids') ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean);

        if (ids.length === 0) {
            return NextResponse.json({ data: [] }, { status: 200 });
        }

        const data = await fetchEstadosDesdeVivi(ids);

        return NextResponse.json(
            {
                data,
            },
            { status: 200 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const timestamp = new Date().toISOString();

        return NextResponse.json(
            {
                error: 'Error al obtener el estado de las notificaciones',
                message,
                timestamp,
            },
            { status: 502 },
        );
    }
}
