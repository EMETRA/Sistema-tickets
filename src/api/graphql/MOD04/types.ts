/**
 * Types para MOD04 - Reporte VISA Nómina
 */
export interface VisaNominaInput {
  empresa: string;
  tipoNomina: string;
  maestroNomina: string;
  tipoPago: string;
  unidadPresupuestaria: string;
}

export interface VisaNominaExcelExport {
  contentBase64: string;
  filename: string;
  mimeType: string;
  totalEmpleados: number;
  totalMovimientos: number;
}

export interface GetVisaNominaExportExcelResponse {
  visaNominaExportExcel: VisaNominaExcelExport;
}
