import { gql } from 'graphql-request';
import { GetStatusesResponse } from './types';

export const GET_STATUSES_QUERY = gql`
  query {
    ticketStatuses {
      id
      nombre
      esFinal
    }
  }
`;

export type GetStatusesResponseType = GetStatusesResponse;
