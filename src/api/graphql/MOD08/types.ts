/**
 * Types para MOD08 - Reportes de Anulados
 */

/**
 * Enum de tipos de reportes de anulados
 * - RECIBOS_PAGO: Recibos de pago anulados
 * - TICKET_PARQUEOS: Tickets de parqueo anulados
 * - PARALELO_FORMAS: Paralelo de formas anuladas
 */
export enum TipoReporteAnulado {
  RECIBOS_PAGO = 'RECIBOS_PAGO',
  TICKET_PARQUEOS = 'TICKET_PARQUEOS',
  PARALELO_FORMAS = 'PARALELO_FORMAS',
}

/**
 * Información de un tipo de reporte
 */
export interface ReporteAnuladoTipoInfo {
  codigo: TipoReporteAnulado;
  etiqueta: string;
}

/**
 * Respuesta para obtener tipos de reportes
 */
export interface GetReporteAnuladosTiposResponse {
  reporteAnuladosTipos: ReporteAnuladoTipoInfo[];
}

/**
 * Input para filtrar reportes anulados
 * Validación requerida:
 * - Formato de fechas: YYYY-MM-DD
 * - Fechas válidas del calendario
 * - fechaInicio <= fechaFin
 */
export interface ReporteAnuladosInput {
  fechaInicio: string;
  fechaFin: string;
  tipoReporte: TipoReporteAnulado;
}

/**
 * Par clave-valor de un campo en una fila del reporte
 */
export interface ReporteAnuladoCampo {
  nombre: string;
  valor: string | null;
}

/**
 * Fila del reporte (columnas dinámicas)
 */
export interface ReporteAnuladoFila {
  campos: ReporteAnuladoCampo[];
}

/**
 * Resultados del reporte anulados
 * Estructura dinámica con columnas variables según el tipo de reporte
 */
export interface ReporteAnuladosResultado {
  tipoReporte: TipoReporteAnulado;
  fechaInicio: string;
  fechaFin: string;
  columnas: string[];
  total: number;
  filas: ReporteAnuladoFila[];
}

/**
 * Respuesta para obtener resultados del reporte
 */
export interface GetReporteAnuladosResultadosResponse {
  reporteAnuladosResultados: ReporteAnuladosResultado;
}

/**
 * Exportación Excel del reporte (base64)
 * Incluye información de bitácora si está configurada
 */
export interface ReporteAnuladosExcelExport {
  filename: string;
  mimeType: string;
  contentBase64: string;
  totalFilas: number;
  bitacoraId?: number | null;
}

/**
 * Respuesta para exportar a Excel
 */
export interface GetReporteAnuladosExcelResponse {
  reporteAnuladosExportExcel: ReporteAnuladosExcelExport;
}
