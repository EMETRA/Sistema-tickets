/**
 * Query GraphQL para obtener colaboradores disponibles
 *
 * Usado para: Select del formulario de reportes semanales
 * Retorna: Lista de colaboradores activos
 */
export const GET_REPORTE_SEMANAL_COLABORADORES_QUERY = `
  query ReporteSemanalColaboradores {
    reporteSemanalColaboradores {
      id
      nombre
    }
  }
`;
