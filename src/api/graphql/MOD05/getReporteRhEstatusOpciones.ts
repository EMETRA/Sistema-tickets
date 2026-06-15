/**
 * Query GraphQL para obtener opciones de status para reporte RRHH
 * 
 * Retorna:
 * - codigo
 * - etiqueta
 */
export const GET_REPORTE_RH_ESTATUS_OPCIONES_QUERY = `
  query ReporteRhEstatusOpciones {
    reporteRhEstatusOpciones {
      codigo
      etiqueta
    }
  }
`;
