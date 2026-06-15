/**
 * Types para MOD01 - Reporte Semanal
 */

/**
 * Enumeración del estado/semáforo del proyecto
 */
export enum EstadoProyectoReporte {
  VERDE = "VERDE",
  AMARILLO = "AMARILLO",
  ROJO = "ROJO",
}

/**
 * Colaborador para select del formulario
 */
export interface ColaboradorReporte {
  id: string;
  nombre: string;
}

/**
 * Respuesta para obtener colaboradores
 */
export interface GetReporteSemanalColaboradoresResponse {
  reporteSemanalColaboradores: ColaboradorReporte[];
}

/**
 * Datos de bloqueo en un reporte
 */
export interface BloqueoReporteGql {
  id: string;
  descripcion?: string | null;
  impacto?: string | null;
  accionRequerida?: string | null;
}

/**
 * Tarea planificada en el reporte
 */
export interface TareaPlanReporteGql {
  id: string;
  descripcion: string;
  estado?: string | null;
  fechaCompromiso?: string | null;
  horasEstimadas?: number | null;
}

/**
 * Tarea completada en el reporte
 */
export interface TareaCompletadaReporteGql {
  id: string;
  descripcion: string;
  horasReales?: number | null;
  fechaFinalizacion?: string | null;
}

/**
 * Plan para la próxima semana
 */
export interface PlanProximaSemanaGql {
  id: string;
  descripcion?: string | null;
  horasEstimadas?: number | null;
  fechaCompromiso?: string | null;
}

/**
 * Resumen de reporte semanal (para listados)
 */
export interface ReporteSemanalResumen {
  id: string;
  idColaborador: number;
  nombreColaborador?: string | null;
  proyecto: string;
  fechaInicio: string;
  fechaFin: string;
  estadoProyecto?: EstadoProyectoReporte | null;
  indProductividad?: number | null;
}

/**
 * Detalle completo de un reporte semanal
 */
export interface ReporteSemanalDetalle {
  id: string;
  idColaborador: number;
  nombreColaborador?: string | null;
  cargo: string;
  jefeInmediato?: string | null;
  proyecto: string;
  fechaInicio: string;
  fechaFin: string;
  horasEstimadasTotal?: number | null;
  horasRealesTotal?: number | null;
  tareasPlanificadas: number;
  tareasCompletadas: number;
  tareasEnFecha: number;
  bloqueosActivos: number;
  avancePlanificado?: number | null;
  avanceReal?: number | null;
  desviacionAvance?: number | null;
  porcAvance?: number | null;
  indProductividad?: number | null;
  indCumplimientoFechas?: number | null;
  indCumplimientoTareas?: number | null;
  indDesviacionHoras?: number | null;
  estadoProyecto?: EstadoProyectoReporte | null;
  observaciones?: string | null;
  situacionActual?: string | null;
  createdAt?: string | null;
  tareasPlan: TareaPlanReporteGql[];
  tareasCompletadasLista: TareaCompletadaReporteGql[];
  bloqueo?: BloqueoReporteGql | null;
  planProximaSemana?: PlanProximaSemanaGql | null;
}

/**
 * Respuesta para obtener detalle de reporte
 */
export interface GetReporteSemanalResponse {
  reporteSemanal: ReporteSemanalDetalle;
}

/**
 * Filtros para listar reportes semanales
 */
export interface ReporteSemanalFilterInput {
  idColaborador?: number;
  proyecto?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: number;
}

/**
 * Respuesta para listar reportes semanales
 */
export interface GetReportesSemanalesResponse {
  reportesSemanales: ReporteSemanalResumen[];
}

/**
 * Seguimiento histórico de colaborador
 */
export interface SeguimientoColaboradorReporte {
  idColaborador: number;
  nombreColaborador?: string | null;
  productividadPromedio?: number | null;
  totalReportes: number;
  reportes: ReporteSemanalResumen[];
}

/**
 * Respuesta para obtener seguimiento de colaborador
 */
export interface GetReporteSemanalSeguimientoResponse {
  reporteSemanalSeguimientoColaborador: SeguimientoColaboradorReporte;
}

/**
 * Exportación Excel en base64
 */
export interface ReporteSemanalExcelExport {
  contentBase64: string;
  filename: string;
  mimeType: string;
}

/**
 * Respuesta para exportar Excel
 */
export interface GetReporteSemanalExcelResponse {
  reporteSemanalExportExcel: ReporteSemanalExcelExport;
}
