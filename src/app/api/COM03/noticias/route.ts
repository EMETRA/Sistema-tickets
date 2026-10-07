/**
 * Route Handler: GET /api/COM03/noticias
 *
 * Propósito: Obtener el listado de noticias del panel de Comunicación con filtros opcionales.
 *
 * Query params:
 * - estado: PROGRAMADA | PUBLICADA | BORRADOR | ARCHIVADA
 * - busqueda: string (coincidencia por título)
 *
 * Respuesta exitosa (200):
 * {
 *   data: [ NoticiaListItem ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO [COM03-BACKEND]: descomentar cuando exista la query `noticias` en backend.
// import { graphqlRequest } from '@/api/graphql/client';
// import { GET_NOTICIAS_QUERY } from '@/api/graphql/COM03';
// import type { GetNoticiasResponse } from '@/api/graphql/COM03';
import { EstadoNoticiaENUM, NOTICIAS_DUMMY } from '@/api/graphql/COM03';
import type { EstadoNoticia, NoticiasFilterInput } from '@/api/graphql/COM03';

function isValidEstado(estado: string): estado is EstadoNoticia {
    return Object.values(EstadoNoticiaENUM).includes(estado as EstadoNoticia);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const estado = searchParams.get('estado') || null;
        const busqueda = searchParams.get('busqueda') || null;
        const timestamp = new Date().toISOString();

        if (estado && !isValidEstado(estado)) {
            return NextResponse.json(
                {
                    error: 'Estado inválido',
                    message: `estado debe ser uno de: ${Object.values(EstadoNoticiaENUM).join(', ')} (recibido: ${estado})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        const filters: NoticiasFilterInput = {
            estado: estado ? (estado as EstadoNoticia) : null,
            busqueda,
        };

        // TODO [COM03-BACKEND]: reemplazar el bloque dummy por la llamada real:
        // const response = await graphqlRequest<{ data: GetNoticiasResponse }>(
        //     GET_NOTICIAS_QUERY,
        //     {
        //         variables: {
        //             filters,
        //         },
        //     },
        // );
        // return NextResponse.json({ data: response.data.noticias }, { status: 200 });

        // TODO [COM03-BACKEND]: delay simulado para visualizar el estado de carga.
        await new Promise((resolve) => setTimeout(resolve, 600));

        const term = filters.busqueda?.trim().toLowerCase();
        const data = NOTICIAS_DUMMY.filter((noticia) => {
            if (filters.estado && noticia.estado !== filters.estado) return false;
            if (term && !noticia.titulo.toLowerCase().includes(term)) return false;
            return true;
        });

        return NextResponse.json(
            {
                data,
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
                error: 'Error al obtener noticias',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
