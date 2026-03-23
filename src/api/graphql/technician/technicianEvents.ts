/**
 * Query: Obtener eventos del técnico
 */

import type { TechnicianEventRow } from "./types";

export const GET_TECHNICIAN_EVENTS_QUERY = `
  query GetTechnicianEvents {
    TechnicianEvents {
      id_evento
      titulo
      fecha_inicio
      fecha_fin
    }
  }
`;

export interface GetTechnicianEventsResponse {
    TechnicianEvents: TechnicianEventRow[];
}
