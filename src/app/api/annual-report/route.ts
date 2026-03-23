import { NextRequest, NextResponse } from "next/server";
import { graphqlRequest } from "@/api/graphql/client";
import {
    GET_ANNUAL_REPORT_QUERY,
    type GetAnnualReportResponse,
} from "@/api/graphql/technician";

/**
 * GET /api/annual-report
 *
 * Obtiene el reporte anual del técnico
 * Query params requeridos:
 * - anio: number (REQUERIDO) - Año del reporte
 *
 * Ejemplo:
 * GET /api/annual-report?anio=2025
 *
 * Requiere: Authorization header con JWT token
 */
export async function GET(request: NextRequest) {
    try {
        // Extraer parámetro anio de query params
        const searchParams = request.nextUrl.searchParams;
        const anioParam = searchParams.get("anio");

        if (!anioParam) {
            return NextResponse.json(
                {
                    error: "Parámetro 'anio' requerido",
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        const anio = parseInt(anioParam, 10);
        if (isNaN(anio)) {
            return NextResponse.json(
                {
                    error: "Parámetro 'anio' debe ser un número válido",
                    timestamp: new Date().toISOString(),
                },
                { status: 400 }
            );
        }

        const result = await graphqlRequest<Record<string, unknown>>(
            GET_ANNUAL_REPORT_QUERY,
            {
                variables: { anio },
            }
        );

        const typedResult = result as unknown as GetAnnualReportResponse;

        return NextResponse.json(typedResult);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        const statusCode =
            error instanceof Error && error.message.includes("401") ? 401 : 500;

        return NextResponse.json(
            {
                error: message,
                timestamp: new Date().toISOString(),
            },
            { status: statusCode }
        );
    }
}
