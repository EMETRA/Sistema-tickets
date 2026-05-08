/**
 * Query GraphQL para obtener todos los usuarios
 */
export const GET_USERS_QUERY = `
  query GetUsers {
    users {
      createdAt
      email
      id
      name
      status
      updatedAt
    }
  }
`;

export type { GetUsersResponse } from './types';
