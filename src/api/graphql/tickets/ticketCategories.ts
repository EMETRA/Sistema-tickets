/**
 * Query GraphQL para obtener catálogo de categorías
 *
 * Variables: Ninguna
 * Respuesta: { ticketCategories: [TicketCategoria...] }
 *
 * Descripción:
 * - Obtiene todas las categorías disponibles para tickets
 * - Retorna id, nombre, descripcion, activo
 */
export const GET_TICKET_CATEGORIES_QUERY = `
  query GetTicketCategories {
    ticketCategories {
      id
      nombre
      descripcion
      activo
    }
  }
`;

export type { GetTicketCategoriesResponse } from './types';
