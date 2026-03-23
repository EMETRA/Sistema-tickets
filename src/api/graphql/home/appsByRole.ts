/**
 * Query: Obtener aplicaciones disponibles según rol del usuario
 */

import type { AppLink } from "./types";

export const GET_APPS_BY_ROLE_QUERY = `
  query GetAppsByRole {
    appsByRole {
      nombre
      icono
      ruta
    }
  }
`;

export interface GetAppsByRoleResponse {
  appsByRole: AppLink[];
}
