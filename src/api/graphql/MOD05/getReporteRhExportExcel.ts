/**
 * Query GraphQL para exportar el reporte RRHH a Excel
 * 
 * Parámetros:
 * - input: ReporteRhInput
 * 
 * Retorna:
 * - contentBase64
 * - filename
 * - mimeType
 * - totalFilas
 */
export const GET_REPORTE_RH_EXPORT_EXCEL_QUERY = `
  query ReporteRhExportExcel($input: ReporteRhInput!) {
    reporteRhExportExcel(input: $input) {
      contentBase64
      filename
      mimeType
      totalFilas
    }
  }
`;
