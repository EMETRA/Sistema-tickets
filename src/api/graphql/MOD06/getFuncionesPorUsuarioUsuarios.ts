/**
 * Query GraphQL para obtener funciones por usuario para usuarios
 *
 * Retorna:
 * - asignaUsuario
 * - usuario
 */
export const GET_FUNCIONES_POR_USUARIO_USUARIOS_QUERY = `
  query FuncionesPorUsuarioUsuarios {
    funcionesPorUsuarioUsuarios {
      asignaUsuario
      usuario
    }
  }
`;
