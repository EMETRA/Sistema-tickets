/**
 * Query GraphQL para obtener un ticket por ID
 *
 * Variables: { ticketId: ID! }
 * Respuesta: { ticket: Ticket }
 *
 * Descripción:
 * - Obtiene un ticket específico por su ID
 * - Retorna todos los campos del ticket
 */
export const GET_TICKET_BY_ID_QUERY = `
  query GetTicketById($ticketId: ID!) {
    ticket(id: $ticketId) {
      categoriaId
      codigo
      descripcion
      estadoId
      fechaActualizacion
      fechaCierre
      fechaCreacion
      id
      prioridadId
      tiempoEstimado
      titulo
      usuarioAsignadoId
      usuarioCreadorId
    }
  }
`;

export type { GetTicketByIdResponse } from './types';
