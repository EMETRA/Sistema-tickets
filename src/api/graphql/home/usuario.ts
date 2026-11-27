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
      perfil { id nombre descripcion }
      roles { id nombre descripcion }
      departamento
      direccion
      puesto
      permisos
    }
  }
`;

/**
 * Perfil de otra persona. El API expone `user(id)` (no `usuarioById`); los alias conservan la
 * forma `UsuarioPerfil` que usan las pantallas.
 */
export const GET_USER_BY_ID_QUERY = `
  query UsuarioById($idUsuario: Int!) {
    usuarioById: user(id: $idUsuario) {
      avatar
      departamento
      email
      id_usuario: id
      nombre: name
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
