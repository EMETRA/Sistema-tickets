/**
 * Route Handler: GET /api/COM03/etiquetas
 *
 * Propósito: Obtener el catálogo de etiquetas de noticias (TB_ETIQUETA).
 *
 * Respuesta exitosa (200):
 * {
 *   data: [ EtiquetaNoticia ]
 * }
 */

import { NextResponse } from 'next/server';
// TODO [COM03-BACKEND]: descomentar cuando exista la query `etiquetasNoticia` en backend.
// import { graphqlRequest } from '@/api/graphql/client';
// import { GET_ETIQUETAS_NOTICIA_QUERY } from '@/api/graphql/COM03';
// import type { GetEtiquetasNoticiaResponse } from '@/api/graphql/COM03';
import { ETIQUETAS_NOTICIA_DUMMY } from '@/api/graphql/COM03';

export async function GET() {
    try {
        // TODO [COM03-BACKEND]: reemplazar el dummy por la llamada real:
        // const response = await graphqlRequest<{ data: GetEtiquetasNoticiaResponse }>(
        //     GET_ETIQUETAS_NOTICIA_QUERY,
        // );
        // return NextResponse.json({ data: response.data.etiquetasNoticia }, { status: 200 });

        return NextResponse.json(
            {
                data: ETIQUETAS_NOTICIA_DUMMY,
            },
            { status: 200 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        const timestamp = new Date().toISOString();

        if (message.includes('401') || message.includes('Unauthorized')) {
            return NextResponse.json(
                {
                    error: 'No autorizado',
                    message: 'Sesión expirada o credenciales inválidas',
                    timestamp,
                },
                { status: 401 },
            );
        }

        return NextResponse.json(
            {
                error: 'Error al obtener etiquetas de noticias',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
