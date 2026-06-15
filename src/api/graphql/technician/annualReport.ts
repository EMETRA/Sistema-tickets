/**
 * Query: Obtener reporte anual del técnico
 */

import type { AnnualReport } from "./types";

export const GET_ANNUAL_REPORT_QUERY = `
  query GetAnnualReport($anio: Int!) {
    annualReport(anio: $anio) {
      anio
      data {
        mes
        ticketsCreados
      }
    }
  }
`;

export interface GetAnnualReportResponse {
    annualReport: AnnualReport;
}
