/**
 * Login Mutation
 */

/**
 * Mutation GraphQL para Login
 * 
 * Variables: LoginInput { email, clave }
 * Respuesta: { login: LoginResponse }
 * 
 */
export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      refresh_token
      expires_in
    }
  }
`;
