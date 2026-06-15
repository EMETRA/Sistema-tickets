/**
 * Query GraphQL para obtener comentarios de un ticket
 *
 * Variables: { ticketId: ID! }
 * Respuesta: { ticketComments: [TicketComentario...] }
 *
 * Descripción:
 * - Obtiene todos los comentarios de un ticket específico
 * - Retorna id, ticketId, usuarioId, comentario, esInterno, fecha
 */
export const GET_TICKET_COMMENTS_QUERY = `
  query GetTicketComments($ticketId: ID!) {
    ticketComments(ticketId: $ticketId) {
      id
      ticketId
      usuarioId
      comentario
      esInterno
      fecha
    }
  }
`;

export type { GetTicketCommentsResponse } from './types';
