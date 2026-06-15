/**
 * Query GraphQL para obtener funciones por usuario para aplicaciones
 *
 * Retorna:
 * - aplicacion
 * - nombre
 */
export const GET_FUNCIONES_POR_USUARIO_APLICACIONES_QUERY = `
  query FuncionesPorUsuarioAplicaciones {
    funcionesPorUsuarioAplicaciones {
      aplicacion
      nombre
    }
  }
`;
