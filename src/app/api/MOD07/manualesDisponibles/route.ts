/**
 * Route Handler: GET /api/MOD07/manualesDisponibles
 *
 * Propósito: Obtener el listado de manuales disponibles con filtros opcionales.
 *
 * Query params:
 * - busqueda: string
 * - categoria: EMETRA | FINANCIERO | NORMAS | OTROS | PMT | SIAF | VEHICULOS
 *
 * Respuesta exitosa (200):
 * {
 *   data: [ ManualInfo ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_MANUALES_DISPONIBLES_QUERY, CategoriaManual, CategoriaManualENUM } from '@/api/graphql/MOD07';
import type { GetManualesDisponiblesResponse, ManualesFilterInput } from '@/api/graphql/MOD07';

function isValidCategoria(categoria: string): categoria is CategoriaManual {
    return Object.values(CategoriaManualENUM).includes(categoria as CategoriaManual);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const busqueda = searchParams.get('busqueda') || null;
        const categoria = searchParams.get('categoria') || null;
        const timestamp = new Date().toISOString();

        if (categoria && !isValidCategoria(categoria)) {
            return NextResponse.json(
                {
                    error: 'Categoría inválida',
                    message: `categoria debe ser uno de: ${Object.values(CategoriaManualENUM).join(', ')} (recibido: ${categoria})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        const filters: ManualesFilterInput = {
            busqueda,
            categoria: categoria ? (categoria as CategoriaManual) : null,
        };

        const response = await graphqlRequest<{ data: GetManualesDisponiblesResponse }>(
            GET_MANUALES_DISPONIBLES_QUERY,
            {
                variables: {
                    filters,
                },
            },
        );

        return NextResponse.json(
            {
                data: response.data.manualesDisponibles,
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
                error: 'Error al obtener manuales disponibles',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
