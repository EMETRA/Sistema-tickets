/**
 * Route Handler: GET /api/COM03/permisos
 *
 * Propósito: Obtener los permisos de noticias del usuario de la sesión (api-tickets, `usuario { permisos }`),
 * para mostrar u ocultar botones en el Panel (README "Noticias CMS", sección 2).
 *
 * Respuesta exitosa (200):
 * {
 *   data: string[]   // p. ej. ["VIVI_NOTICIAS_LEER", "VIVI_NOTICIAS_EDITAR"]; [] si no trae ninguno
 * }
 */

import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_PERMISOS_NOTICIAS_QUERY, PERMISOS_SIMULADOS } from '@/api/graphql/COM03';
import type { GetPermisosNoticiasResponse } from '@/api/graphql/COM03';

export async function GET() {
    try {
        if (PERMISOS_SIMULADOS) {
            return NextResponse.json({ data: PERMISOS_SIMULADOS }, { status: 200 });
        }

        const response = await graphqlRequest<GetPermisosNoticiasResponse>(GET_PERMISOS_NOTICIAS_QUERY);

        return NextResponse.json(
            {
                data: response.usuario?.permisos ?? [],
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
                error: 'Error al obtener permisos de noticias',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
