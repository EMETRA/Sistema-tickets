import { gql } from 'graphql-request';
import { GetLastMovementsResponse } from './types';

export const GET_LAST_MOVEMENTS_QUERY = gql`
  query lastMovements {
    lastMovements {
      tipo
      ticket_codigo
      usuario
      detalle
      fecha
    }
  }
`;

export type GetLastMovementsResponseType = GetLastMovementsResponse;
