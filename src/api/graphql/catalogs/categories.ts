import { gql } from 'graphql-request';
import { GetCategoriesResponse } from './types';

export const GET_CATEGORIES_QUERY = gql`
  query {
    ticketCategories {
      id
      nombre
      descripcion
      activo
    }
  }
`;

export type GetCategoriesResponseType = GetCategoriesResponse;
