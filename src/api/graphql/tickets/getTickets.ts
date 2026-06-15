/**
 * Query GraphQL para obtener tickets
 *
 * Variables: GetTicketsInput (filtros opcionales)
 * Respuesta: { tickets: [Ticket...] }
 *
 * Descripción:
 * - Obtiene lista de tickets
 * - Soporta filtros: estadoId, categoriaId, usuarioAsignadoId, prioridadId.
 * - Retorna todos los campos del ticket
 */
export const GET_TICKETS_QUERY = `
  query Tickets($filters: TicketFilterInput) {
    tickets(filters: $filters) {
      asignado {
        avatar
        nombre
        departamento
      }
      categoriaId
      categoriaNombre
      codigo
      creador {
        avatar
        nombre
        departamento
      }
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
