/**
 * Query GraphQL para obtener historial de un ticket
 *
 * Variables: { ticketId: ID! }
 * Respuesta: { ticketHistory: [TicketHistorial...] }
 *
 * Descripción:
 * - Obtiene el historial de cambios de un ticket
 * - Retorna id, ticketId, usuarioId, accion, valorAnterior, valorNuevo, fecha
 */
export const GET_TICKET_HISTORY_QUERY = `
  query GetTicketHistory($ticketId: ID!) {
    ticketHistory(ticketId: $ticketId) {
      id
      ticketId
      usuarioId
      accion
      valorAnterior
      valorNuevo
      fecha
    }
  }
`;

export type { GetTicketHistoryResponse } from './types';
