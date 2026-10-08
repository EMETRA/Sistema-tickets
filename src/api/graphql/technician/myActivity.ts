/**
 * Query: Obtener mi actividad reciente
 */

import type { ActivityRow } from "./types";

export const GET_MY_ACTIVITY_QUERY = `
  query GetMyActivity($limit: Int = 10) {
    myActivity(limit: $limit) {
      tipo
      codigo_ticket
      descripcion
      fecha
    }
  }
`;

export interface GetMyActivityResponse {
    myActivity: ActivityRow[];
}
