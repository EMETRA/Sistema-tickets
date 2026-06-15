/**
 * Query GraphQL para obtener resultados del reporte RRHH
 * 
 * Parámetros:
 * - input: ReporteRhInput
 * 
 * Retorna:
 * - camposSeleccionados
 * - estatus
 * - fechaIngresoDesde
 * - fechaIngresoHasta
 * - filas (con celdas que incluyen campo, etiqueta y valor)
 * - total
 */
export const GET_REPORTE_RH_RESULTADOS_QUERY = `
  query ReporteRhResultados($input: ReporteRhInput!) {
    reporteRhResultados(input: $input) {
      camposSeleccionados
      estatus
      fechaIngresoDesde
      fechaIngresoHasta
      filas {
        celdas {
          campo
          etiqueta
          valor
        }
      }
      total
    }
  }
`;
