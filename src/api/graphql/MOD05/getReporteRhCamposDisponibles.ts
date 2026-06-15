/**
 * Query GraphQL para obtener catálogo de campos disponibles para reporte RRHH
 * 
 * Retorna:
 * - codigo
 * - etiqueta
 */
export const GET_REPORTE_RH_CAMPOS_DISPONIBLES_QUERY = `
  query ReporteRhCamposDisponibles {
    reporteRhCamposDisponibles {
      codigo
      etiqueta
    }
  }
`;
