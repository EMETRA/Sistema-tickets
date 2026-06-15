/**
 * GraphQL Query: roles
 * Fetches all available roles in the system
 */

export const GET_ROLES_QUERY = `
  query GetRoles {
    roles {
      id_rol
      nombre_rol
      descripcion
    }
  }
`;
