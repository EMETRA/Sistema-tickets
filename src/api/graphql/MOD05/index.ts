/**
 * Exportaciones de queries y types para MOD05 - Reporte general RRHH
 */

export { GET_REPORTE_RH_CAMPOS_DISPONIBLES_QUERY } from './getReporteRhCamposDisponibles';
export { GET_REPORTE_RH_ESTATUS_OPCIONES_QUERY } from './getReporteRhEstatusOpciones';
export { GET_REPORTE_RH_RESULTADOS_QUERY } from './getReporteRhResultados';
export { GET_REPORTE_RH_EXPORT_EXCEL_QUERY } from './getReporteRhExportExcel';

export type {
    CampoEmpleadoRh,
    EstatusEmpleadoRh,
    ReporteRhCampoInfo,
    ReporteRhEstatusInfo,
    ReporteRhInput,
    ReporteRhExcelExport,
    ReporteRhResultados,
    ReporteRhFila,
    ReporteRhValorCelda,
    GetReporteRhCamposDisponiblesResponse,
    GetReporteRhEstatusOpcionesResponse,
    GetReporteRhResultadosResponse,
    GetReporteRhExportExcelResponse,
} from './types';

export { CampoEmpleadoRh as CampoEmpleadoRhEnum, EstatusEmpleadoRh as EstatusEmpleadoRhEnum } from './types';
