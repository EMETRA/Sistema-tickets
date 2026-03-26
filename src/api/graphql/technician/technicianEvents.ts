/**
 * Query: Obtener eventos del técnico
 */

import type { TechnicianEventRow } from "./types";

export const GET_TECHNICIAN_EVENTS_QUERY = `
  query GetTechnicianEvents($fecha_inicio: String, $fecha_fin: String) {
    TechnicianEvents(fecha_inicio: $fecha_inicio, fecha_fin: $fecha_fin) {
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
