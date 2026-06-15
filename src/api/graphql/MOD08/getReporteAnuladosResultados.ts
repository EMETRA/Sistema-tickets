/**
 * Query GraphQL para obtener resultados filtrados de reportes anulados
 *
 * Parámetros:
 * - input: ReporteAnuladosInput (requerido)
 *   - fechaInicio: YYYY-MM-DD
 *   - fechaFin: YYYY-MM-DD
 *   - tipoReporte: RECIBOS_PAGO | TICKET_PARQUEOS | PARALELO_FORMAS
 *
 * Validación requerida en frontend:
 * - Formato de fechas válido (YYYY-MM-DD)
 * - Fechas del calendario válidas
 * - fechaInicio <= fechaFin
 *
 * Requiere permisos financieros (Bearer requerido)
 * 
 * Retorna:
 * - tipoReporte: Tipo de reporte solicitado
 * - fechaInicio/fechaFin: Rango consultado
 * - columnas: Lista dinámica de nombres de columnas
 * - total: Cantidad total de filas
 * - filas: Datos con estructura clave-valor dinámica
 */
export const GET_REPORTE_ANULADOS_RESULTADOS_QUERY = `
  query ReporteAnuladosResultados($input: ReporteAnuladosInput!) {
    reporteAnuladosResultados(input: $input) {
      tipoReporte
      fechaInicio
      fechaFin
      columnas
      total
      filas {
        campos {
          nombre
          valor
        }
      }
    }
  }
`;
