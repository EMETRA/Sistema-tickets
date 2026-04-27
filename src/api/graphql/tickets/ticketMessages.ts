/**
 * Query GraphQL para obtener mensajes de un ticket
 *
 * Variables: ticketId (ID del ticket)
 * Respuesta: { ticketMessages: [TicketChatMessage...] }
 *
 * Descripción:
 * - Obtiene lista de mensajes del chat del ticket
 * - Los mensajes incluyen: usuario, fecha, texto y archivos adjuntos
 * - Retorna mensajes del más antiguo al más reciente
 */
export const GET_TICKET_MESSAGES_QUERY = `
  query GetTicketMessages($ticketId: ID!) {
    ticketMessages(ticketId: $ticketId) {
      archivos {
        fecha
        id
        keyStorage
        nombreArchivo
        ticketId
        usuarioId
      }
      fechaEnvio
      textoMensaje
      usuario
    }
  }
`;
