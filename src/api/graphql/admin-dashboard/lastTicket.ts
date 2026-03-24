import { gql } from 'graphql-request';
import { GetLastTicketResponse } from './types';

export const GET_LAST_TICKET_QUERY = gql`
  query lastTicket($limit: Int) {
    lastTicket(limit: $limit) {
      id_ticket
      codigo
      titulo
      categoria
      prioridad
      estado
      creador
      asignado
      fecha_creacion
    }
  }
`;

export type GetLastTicketResponseType = GetLastTicketResponse;
