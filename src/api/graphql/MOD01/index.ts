/**
 * Exportaciones de queries y types para MOD01 - Reporte Semanal
 */

// Queries
export { GET_REPORTE_SEMANAL_COLABORADORES_QUERY } from './getReporteSemanalColaboradores';
export { GET_REPORTES_SEMANALES_QUERY } from './getReportesSemanales';
export { GET_REPORTE_SEMANAL_QUERY } from './getReporteSemanal';
export { GET_REPORTE_SEMANAL_SEGUIMIENTO_QUERY } from './getReporteSemanalSeguimiento';
export { GET_REPORTE_SEMANAL_EXCEL_QUERY } from './getReporteSemanalExcel';

// Types
export type {
    EstadoProyectoReporte,
    ColaboradorReporte,
    GetReporteSemanalColaboradoresResponse,
    BloqueoReporteGql,
    TareaPlanReporteGql,
    TareaCompletadaReporteGql,
    PlanProximaSemanaGql,
    ReporteSemanalResumen,
    ReporteSemanalDetalle,
    GetReporteSemanalResponse,
    ReporteSemanalFilterInput,
    GetReportesSemanalesResponse,
    SeguimientoColaboradorReporte,
    GetReporteSemanalSeguimientoResponse,
    ReporteSemanalExcelExport,
    GetReporteSemanalExcelResponse,
} from './types';
