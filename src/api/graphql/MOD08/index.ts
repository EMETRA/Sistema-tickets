/**
 * Exportaciones de queries y types para MOD08 - Reportes de Anulados
 */

// Queries
export { GET_REPORTE_ANULADOS_TIPOS_QUERY } from './getReporteAnuladosTipos';
export { GET_REPORTE_ANULADOS_RESULTADOS_QUERY } from './getReporteAnuladosResultados';
export { GET_REPORTE_ANULADOS_EXCEL_QUERY } from './getReporteAnuladosExcel';

// Types
export type {
    TipoReporteAnulado,
    ReporteAnuladoTipoInfo,
    GetReporteAnuladosTiposResponse,
    ReporteAnuladosInput,
    ReporteAnuladoCampo,
    ReporteAnuladoFila,
    ReporteAnuladosResultado,
    GetReporteAnuladosResultadosResponse,
    ReporteAnuladosExcelExport,
    GetReporteAnuladosExcelResponse,
} from './types';

export { TipoReporteAnulado as TipoReporteAnuladoEnum} from './types';
