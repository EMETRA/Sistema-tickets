/**
 * Query: Obtener perfil del departamento/equipo del usuario
 */

import type { DepartamentoPerfil } from "./types";

export const GET_PERFIL_EQUIPO_QUERY = `
  query GetPerfilEquipo {
    perfilequipo {
      id_departamento
      nombre
    }
  }
`;

export interface GetPerfilEquipoResponse {
  perfilequipo: DepartamentoPerfil[];
}
