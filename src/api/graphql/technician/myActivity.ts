/**
 * Query: Obtener mi actividad reciente
 */

import type { ActivityRow } from "./types";

export const GET_MY_ACTIVITY_QUERY = `
  query GetMyActivity {
    myActivity {
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
