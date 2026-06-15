/**
 * Query GraphQL para exportar reportes anulados a Excel
 *
 * Parámetros:
 * - input: ReporteAnuladosInput (requerido)
 *   - fechaInicio: YYYY-MM-DD
 *   - fechaFin: YYYY-MM-DD
 *   - tipoReporte: RECIBOS_PAGO | TICKET_PARQUEOS | PARALELO_FORMAS
 *
 * Validación requerida en frontend:
 * - Formato de fechas válido (YYYY-MM-DD)
 * - Fechas del calendario válidas
 * - fechaInicio <= fechaFin
 *
 * Requiere permisos financieros (Bearer requerido)
 * 
 * Retorna:
 * - filename: Nombre del archivo Excel generado
 * - mimeType: Tipo MIME (application/vnd.ms-excel)
 * - contentBase64: Contenido del Excel en base64
 * - totalFilas: Cantidad total de filas en el reporte
 * - bitacoraId: ID de registro en bitácora (si está configurada)
 *
 * Nota: En el frontend se debe decodificar el base64 y descargar el archivo
 */
export const GET_REPORTE_ANULADOS_EXCEL_QUERY = `
  query ReporteAnuladosExportExcel($input: ReporteAnuladosInput!) {
    reporteAnuladosExportExcel(input: $input) {
      filename
      mimeType
      contentBase64
      totalFilas
      bitacoraId
    }
  }
`;
