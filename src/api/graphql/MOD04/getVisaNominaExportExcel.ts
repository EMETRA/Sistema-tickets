/**
 * Query GraphQL para exportar VISA Nómina a Excel
 *
 * Parámetros:
 * - input: VisaNominaInput
 *
 * Retorna:
 * - contentBase64
 * - filename
 * - mimeType
 * - totalEmpleados
 * - totalMovimientos
 */
export const GET_VISA_NOMINA_EXPORT_EXCEL_QUERY = `
  query VisaNominaExportExcel($input: VisaNominaInput!) {
    visaNominaExportExcel(input: $input) {
      contentBase64
      filename
      mimeType
      totalEmpleados
      totalMovimientos
    }
  }
`;
