/**
 * Query GraphQL para obtener tickets de un usuario específico
 *
 * Variables: { idUsuario: Int! }
 * Respuesta: { tickets: [Ticket...] }
 *
 * Descripción:
 * - Obtiene lista de tickets creados por un usuario específico
 * - Retorna todos los campos del ticket
 */
export const GET_TICKETS_BY_USER_ID_QUERY = `
  query TicketsByUsuarioCreador($idUsuario: Int!) {
    ticketsByUsuarioCreador(id_usuario: $idUsuario) {
      categoriaId
      categoriaNombre
      codigo
      descripcion
      estadoId
      estadoNombre
      fechaActualizacion
      fechaCierre
      fechaCreacion
      id
      prioridadId
      prioridadNombre
      tiempoEstimado
      titulo
      usuarioAsignadoId
      usuarioAsignadoNombre
      usuarioCreadorId
      usuarioCreadorNombre
    }
  }
`;
