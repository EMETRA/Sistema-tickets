import { falloModulo } from "@/api/graphql/module-response";
/**
 * Route Handler: GET /api/MOD07/manual
 *
 * Propósito: Obtener un manual por ID.
 *
 * Query params:
 * - id: number
 *
 * Respuesta exitosa (200):
 * {
 *   data: ManualInfo
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_MANUAL_QUERY } from '@/api/graphql/MOD07';
import type { GetManualResponse } from '@/api/graphql/MOD07';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const idParam = searchParams.get('id');
        const timestamp = new Date().toISOString();

        if (!idParam) {
            return NextResponse.json(
                {
                    error: 'Parámetro requerido ausente',
                    message: 'id es requerido',
                    timestamp,
                },
                { status: 400 },
            );
        }

        const id = Number(idParam);

        if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
            return NextResponse.json(
                {
                    error: 'ID inválido',
                    message: `id debe ser un entero positivo (recibido: ${idParam})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        const response = await graphqlRequest<GetManualResponse>(
            GET_MANUAL_QUERY,
            {
                variables: {
                    manualId: id,
                },
            },
        );

        return NextResponse.json(
            {
                data: response.manual,
            },
            { status: 200 },
        );
    } catch (error) { return falloModulo(error, "MOD07/manual"); }
}
