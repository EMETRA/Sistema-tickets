/**
 * Query GraphQL para obtener funciones por usuario con permisos
 *
 * Parámetros:
 * - input: FuncionesPorUsuarioConsultaInput
 *
 * Retorna:
 * - aplicacion
 * - asignaUsuario
 * - empresa
 * - funciones (funcion, nombre, permitido, uso)
 * - totalPermitidas
 */
export const GET_FUNCIONES_POR_USUARIO_PERMISOS_QUERY = `
  query FuncionesPorUsuarioPermisos($input: FuncionesPorUsuarioConsultaInput!) {
    funcionesPorUsuarioPermisos(input: $input) {
      aplicacion
      asignaUsuario
      empresa
      funciones {
        funcion
        nombre
        permitido
        uso
      }
      totalPermitidas
    }
  }
`;
