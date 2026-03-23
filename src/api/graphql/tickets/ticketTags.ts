/**
 * Query GraphQL para obtener tags de un ticket
 *
 * Variables: { ticketId: ID! }
 * Respuesta: { ticketTags: [TicketTag...] }
 *
 * Descripción:
 * - Obtiene todos los tags asociados a un ticket
 * - Retorna id, nombre, color
 */
export const GET_TICKET_TAGS_QUERY = `
  query GetTicketTags($ticketId: ID!) {
    ticketTags(ticketId: $ticketId) {
      id
      nombre
      color
    }
  }
`;

export type { GetTicketTagsResponse } from './types';
