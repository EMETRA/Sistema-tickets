import { gql } from 'graphql-request';
import { GetPrioritiesResponse } from './types';

export const GET_PRIORITIES_QUERY = gql`
  query {
    ticketPriorities {
      id
      nombre
      nivel
      color
    }
  }
`;

export type GetPrioritiesResponseType = GetPrioritiesResponse;
