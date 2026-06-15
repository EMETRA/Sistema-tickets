/**
 * Route Handler: GET /api/MOD07/manualesCategorias
 *
 * Propósito: Obtener categorías de manuales disponibles.
 *
 * Respuesta exitosa (200):
 * {
 *   data: [ { codigo, etiqueta, total } ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_MANUALES_CATEGORIAS_QUERY } from '@/api/graphql/MOD07';
import type { GetManualesCategoriasResponse } from '@/api/graphql/MOD07';

export async function GET(request: NextRequest) {
    try {
        const response = await graphqlRequest<Record<string, unknown>>(
            GET_MANUALES_CATEGORIAS_QUERY
        );

        const typedResponse = response as unknown as GetManualesCategoriasResponse;

        return NextResponse.json(
            {
                data: typedResponse.manualesCategorias,
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
                error: 'Error al obtener categorías de manuales',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
