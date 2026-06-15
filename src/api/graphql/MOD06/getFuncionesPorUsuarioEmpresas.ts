/**
 * Query GraphQL para obtener funciones por usuario para empresas
 *
 * Retorna:
 * - empresa
 * - nombre
 */
export const GET_FUNCIONES_POR_USUARIO_EMPRESAS_QUERY = `
  query FuncionesPorUsuarioEmpresas {
    funcionesPorUsuarioEmpresas {
      empresa
      nombre
    }
  }
`;
