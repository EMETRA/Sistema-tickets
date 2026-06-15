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
    }
  }
`;

export const GET_USER_BY_ID_QUERY = `
  query UsuarioById($idUsuario: Int!) {
    usuarioById(id_usuario: $idUsuario) {
      avatar
      departamento
      email
      id_usuario
      nombre
      rol
    }
  }
`;

export interface GetUserResponse {
  usuario: UsuarioPerfil;
}

export interface GetUserByIdResponse {
  usuario: UsuarioPerfil;
}
