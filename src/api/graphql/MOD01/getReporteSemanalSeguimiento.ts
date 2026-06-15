/**
 * Query GraphQL para obtener seguimiento histórico de un colaborador
 *
 * Parámetros:
 * - idColaborador: ID del colaborador (requerido)
 * - limit: Cantidad máxima de reportes a retornar (opcional)
 *
 * Retorna:
 * - Información del colaborador
 * - Productividad promedio
 * - Lista de reportes históricos
 * - Total de reportes
 */
export const GET_REPORTE_SEMANAL_SEGUIMIENTO_QUERY = `
  query ReporteSemanalSeguimientoColaborador($idColaborador: Int!, $limit: Int) {
    reporteSemanalSeguimientoColaborador(idColaborador: $idColaborador, limit: $limit) {
      idColaborador
      nombreColaborador
      productividadPromedio
      totalReportes
      reportes {
        id
        idColaborador
        nombreColaborador
        proyecto
        fechaInicio
        fechaFin
        estadoProyecto
        indProductividad
      }
    }
  }
`;
