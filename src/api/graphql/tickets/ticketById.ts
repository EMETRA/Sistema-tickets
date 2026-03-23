/**
 * Query GraphQL para obtener un ticket por ID
 *
 * Variables: { id: ID! }
 * Respuesta: { ticket: Ticket }
 *
 * Descripción:
 * - Obtiene un ticket específico por su ID
 * - Retorna todos los campos del ticket o null si no existe
 */
export const GET_TICKET_BY_ID_QUERY = `
  query GetTicketById($id: ID!) {
    ticket(id: $id) {
      id
      codigo
      titulo
      descripcion
      tiempoEstimado
      usuarioCreadorId
      usuarioAsignadoId
      categoriaId
      prioridadId
      estadoId
      fechaCreacion
      fechaActualizacion
      fechaCierre
    }
  }
`;

export type { GetTicketByIdResponse } from './types';
