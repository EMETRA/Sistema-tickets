/**
 * Query: Obtener perfil del usuario autenticado
 */

import type { UsuarioPerfil } from "./types";

export const GET_USER_QUERY = `
  query GetUser {
    usuario {
      id_usuario
      nombre
      email
      rol
      departamento
      avatar
    }
  }
`;

export interface GetUserResponse {
  usuario: UsuarioPerfil;
}
