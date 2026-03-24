/**
 * Query GraphQL para obtener catálogo de prioridades
 *
 * Variables: Ninguna
 * Respuesta: { ticketPriorities: [TicketPrioridad...] }
 *
 * Descripción:
 * - Obtiene todas las prioridades disponibles para tickets
 * - Retorna id, nombre, nivel, color
 */
export const GET_TICKET_PRIORITIES_QUERY = `
  query GetTicketPriorities {
    ticketPriorities {
      id
      nombre
      nivel
      color
    }
  }
`;

export type { GetTicketPrioritiesResponse } from './types';
