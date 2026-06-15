/**
 * Query: Obtener últimos tickets del técnico
 */

import type { TechnicianTicketRow } from "./types";

export const GET_TECHNICIAN_LAST_TICKETS_QUERY = `
  query GetTechnicianLastTickets {
    technicianLastTickets {
      codigo
      titulo
      prioridad
      estado
      fecha_creacion
    }
  }
`;

export interface GetTechnicianLastTicketsResponse {
    technicianLastTickets: TechnicianTicketRow[];
}
