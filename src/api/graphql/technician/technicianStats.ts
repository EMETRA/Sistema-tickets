/**
 * Query: Obtener estadísticas de desempeño del técnico
 */

import type { TechnicianStats } from "./types";

export const GET_TECHNICIAN_STATS_QUERY = `
  query GetTechnicianStats {
    technicianStats {
      tickets
      asignados
      resueltos
      pendientes
      grafico_rendimiento {
        mes
        resueltos
      }
    }
  }
`;

export interface GetTechnicianStatsResponse {
    technicianStats: TechnicianStats;
}
