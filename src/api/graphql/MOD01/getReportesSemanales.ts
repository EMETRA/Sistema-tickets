/**
 * Query GraphQL para listar reportes semanales con filtros
 *
 * Filtros disponibles:
 * - idColaborador: Filtrar por colaborador específico
 * - proyecto: Filtrar por nombre del proyecto
 * - fechaDesde: Fecha inicio del rango
 * - fechaHasta: Fecha fin del rango
 * - limit: Cantidad de reportes a retornar (default 50)
 *
 * Retorna: Lista de reportes semanales
 */
export const GET_REPORTES_SEMANALES_QUERY = `
  query ReportesSemanales($filters: ReporteSemanalFilterInput) {
    reportesSemanales(filters: $filters) {
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
`;
