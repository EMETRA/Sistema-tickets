/**
 * Query GraphQL para obtener todos los usuarios
 */
export const GET_USERS_QUERY = `
  query Users {
    users {
      avatar
      departamento
      email
      id
      name
      rol
      status
    }
  }
`;

export type { GetUsersResponse } from './types';
