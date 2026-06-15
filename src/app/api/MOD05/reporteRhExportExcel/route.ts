/**
 * Route Handler: GET /api/MOD05/reporteRhExportExcel
 *
 * Propósito: Exportar el reporte RRHH a Excel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { graphqlRequest } from '@/api/graphql/client';
import {
    GET_REPORTE_RH_EXPORT_EXCEL_QUERY,
    EstatusEmpleadoRh,
    EstatusEmpleadoRhEnum,
    CampoEmpleadoRh,
} from '@/api/graphql/MOD05';
import type { GetReporteRhExportExcelResponse, ReporteRhInput } from '@/api/graphql/MOD05';

function isValidDateFormat(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
        return false;
    }

    const date = new Date(dateString);
    const timestamp = date.getTime();

    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
        return false;
    }

    const isoDate = date.toISOString().split('T')[0];
    return isoDate === dateString;
}

function isValidEstatus(estatus: string): estatus is EstatusEmpleadoRh {
    return Object.values(EstatusEmpleadoRhEnum).includes(estatus as EstatusEmpleadoRh);
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const estatus = searchParams.get('estatus');
        const fechaIngresoDesde = searchParams.get('fechaIngresoDesde');
        const fechaIngresoHasta = searchParams.get('fechaIngresoHasta');
        const campos = searchParams.getAll('campos');
        const timestamp = new Date().toISOString();

        if (!estatus) {
            return NextResponse.json(
                {
                    error: 'Parámetro requerido ausente',
                    message: 'estatus es requerido',
                    timestamp,
                },
                { status: 400 },
            );
        }

        if (!isValidEstatus(estatus)) {
            return NextResponse.json(
                {
                    error: 'Estatus inválido',
                    message: `estatus debe ser uno de: ${Object.values(EstatusEmpleadoRhEnum).join(', ')} (recibido: ${estatus})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        if (fechaIngresoDesde && !isValidDateFormat(fechaIngresoDesde)) {
            return NextResponse.json(
                {
                    error: 'Formato de fecha inválido',
                    message: `fechaIngresoDesde debe estar en formato YYYY-MM-DD (recibido: ${fechaIngresoDesde})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        if (fechaIngresoHasta && !isValidDateFormat(fechaIngresoHasta)) {
            return NextResponse.json(
                {
                    error: 'Formato de fecha inválido',
                    message: `fechaIngresoHasta debe estar en formato YYYY-MM-DD (recibido: ${fechaIngresoHasta})`,
                    timestamp,
                },
                { status: 400 },
            );
        }

        const parsedCampos = campos.filter(Boolean) as string[];

        if (parsedCampos.length === 0) {
            return NextResponse.json(
                {
                    error: 'Campos requeridos ausentes',
                    message: 'Debe enviar al menos un valor de campos',
                    timestamp,
                },
                { status: 400 },
            );
        }

        const input: ReporteRhInput = {
            estatus: estatus as EstatusEmpleadoRh,
            fechaIngresoDesde: fechaIngresoDesde || null,
            fechaIngresoHasta: fechaIngresoHasta || null,
            campos: parsedCampos as unknown as CampoEmpleadoRh[],
        };

        const response = await graphqlRequest<Record<string, unknown>>(
            GET_REPORTE_RH_EXPORT_EXCEL_QUERY,
            {
                variables: { input },
            },
        );

        const typedResponse = response as unknown as GetReporteRhExportExcelResponse;

        return NextResponse.json(
            {
                data: typedResponse.reporteRhExportExcel,
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
                error: 'Error al exportar reporte a Excel',
                message,
                timestamp,
            },
            { status: 500 },
        );
    }
}
