import { falloModulo } from "@/api/graphql/module-response";
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

import { NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_MANUALES_CATEGORIAS_QUERY } from '@/api/graphql/MOD07';
import type { GetManualesCategoriasResponse } from '@/api/graphql/MOD07';

export async function GET() {
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
    } catch (error) { return falloModulo(error, "MOD07/manualesCategorias"); }
}
