/**
 * Query GraphQL para obtener adjuntos de un ticket
 *
 * Variables: { ticketId: ID! }
 * Respuesta: { ticketAttachments: [TicketAdjunto...] }
 *
 * Descripción:
 * - Obtiene todos los archivos adjuntos de un ticket
 * - Retorna id, ticketId, usuarioId, nombreArchivo, keyStorage, fecha
 */
export const GET_TICKET_ATTACHMENTS_QUERY = `
  query GetTicketAttachments($ticketId: ID!) {
    ticketAttachments(ticketId: $ticketId) {
      id
      ticketId
      usuarioId
      nombreArchivo
      keyStorage
      fecha
    }
  }
`;

export type { GetTicketAttachmentsResponse } from './types';
