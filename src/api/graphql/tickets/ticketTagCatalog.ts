/**
 * Query GraphQL para obtener catálogo de tags
 *
 * Variables: Ninguna
 * Respuesta: { ticketTagCatalog: [TicketTag...] }
 *
 * Descripción:
 * - Obtiene todos los tags disponibles
 * - Retorna id, nombre, color
 */
export const GET_TICKET_TAG_CATALOG_QUERY = `
  query GetTicketTagCatalog {
    ticketTagCatalog {
      id
      nombre
      color
    }
  }
`;

export type { GetTicketTagCatalogResponse } from './types';
