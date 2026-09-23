/**
 * Route Handler: GET /api/COM03/noticia/[id]
 *
 * Propósito: Obtener el detalle de una noticia para el modo edición del formulario.
 *
 * Respuesta exitosa (200):
 * {
 *   data: NoticiaDetalle
 * }
 *
 * Respuesta 404 si la noticia no existe.
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO [COM03-BACKEND]: descomentar cuando exista la query `noticia(id)` en backend.
// import { graphqlRequest } from '@/api/graphql/client';
// import { GET_NOTICIA_QUERY } from '@/api/graphql/COM03';
// import type { GetNoticiaResponse } from '@/api/graphql/COM03';
import { getNoticiaDummy } from '@/api/graphql/COM03';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const timestamp = new Date().toISOString();

        if (!id) {
            return NextResponse.json(
                {
                    error: 'ID de noticia requerido',
                    message: 'Debe enviarse el id de la noticia',
                    timestamp,
                },
                { status: 400 },
            );
        }

        // TODO [COM03-BACKEND]: reemplazar el bloque dummy por la llamada real:
        // const response = await graphqlRequest<{ data: GetNoticiaResponse }>(
        //     GET_NOTICIA_QUERY,
        //     {
        //         variables: {
        //             id,
        //         },
        //     },
        // );
        // const noticia = response.data.noticia;

        // TODO [COM03-BACKEND]: delay simulado para visualizar el estado de carga.
        await new Promise((resolve) => setTimeout(resolve, 600));
        const noticia = getNoticiaDummy(id);

        if (!noticia) {
            return NextResponse.json(
                {
                    error: 'Noticia no encontrada',
                    message: `No existe una noticia con id ${id}`,
                    timestamp,
                },
                { status: 404 },
            );
        }

        return NextResponse.json(
            {
                data: noticia,
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
                error: 'Error al obtener la noticia',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
