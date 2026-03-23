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
  query GetTickets($filters: TicketFilterInput) {
    tickets(filters: $filters) {
      id
      codigo
      titulo
      descripcion
      tiempoEstimado
      usuarioCreadorId
      usuarioAsignadoId
      categoriaId
      prioridadId
      estadoId
      fechaCreacion
      fechaActualizacion
      fechaCierre
    }
  }
`;
