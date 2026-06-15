import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import { GET_VISA_NOMINA_EXPORT_EXCEL_QUERY } from '@/api/graphql/MOD04';
import type { GetVisaNominaExportExcelResponse, VisaNominaInput } from '@/api/graphql/MOD04';

function getMissingFields(params: URLSearchParams): string[] {
    return ['empresa', 'tipoNomina', 'maestroNomina', 'tipoPago', 'unidadPresupuestaria'].filter(
        (field) => !params.get(field) || params.get(field)?.trim() === '',
    );
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const missingFields = getMissingFields(searchParams);
        const timestamp = new Date().toISOString();

        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    error: 'Parámetros requeridos ausentes',
                    message: `Faltan los siguientes parámetros: ${missingFields.join(', ')}`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        const input: VisaNominaInput = {
            empresa: String(searchParams.get('empresa') ?? ''),
            tipoNomina: String(searchParams.get('tipoNomina') ?? ''),
            maestroNomina: String(searchParams.get('maestroNomina') ?? ''),
            tipoPago: String(searchParams.get('tipoPago') ?? ''),
            unidadPresupuestaria: String(searchParams.get('unidadPresupuestaria') ?? ''),
        };

        const response = await graphqlRequest<{ data: GetVisaNominaExportExcelResponse }>(
            GET_VISA_NOMINA_EXPORT_EXCEL_QUERY,
            { variables: { input } },
        );

        return NextResponse.json({ data: response.data.visaNominaExportExcel }, { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
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
                error: 'Error al exportar VISA Nómina',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
