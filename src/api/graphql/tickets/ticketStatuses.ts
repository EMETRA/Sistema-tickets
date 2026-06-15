/**
 * Query GraphQL para obtener catálogo de estados
 *
 * Variables: Ninguna
 * Respuesta: { ticketStatuses: [TicketEstado...] }
 *
 * Descripción:
 * - Obtiene todos los estados disponibles para tickets
 * - Retorna id, nombre, esFinal
 */
export const GET_TICKET_STATUSES_QUERY = `
  query GetTicketStatuses {
    ticketStatuses {
      id
      nombre
      esFinal
    }
  }
`;

export type { GetTicketStatusesResponse } from './types';
