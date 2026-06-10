/**
 * Query GraphQL para exportar reporte a Excel
 *
 * Parámetro:
 * - id: ID del reporte a exportar
 *
 * Retorna:
 * - contentBase64: Contenido del Excel codificado en base64
 * - filename: Nombre del archivo Excel
 * - mimeType: Tipo MIME del archivo
 *
 * Nota: En el frontend se debe decodificar el base64 y descargar el archivo
 */
export const GET_REPORTE_SEMANAL_EXCEL_QUERY = `
  query ReporteSemanalExportExcel($id: ID!) {
    reporteSemanalExportExcel(id: $id) {
      contentBase64
      filename
      mimeType
    }
  }
`;
