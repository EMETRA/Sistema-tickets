/**
 * Query: Obtener estadísticas del usuario
 */

import type { MyStats } from "./types";

export const GET_MY_STATS_QUERY = `
  query GetMyStats {
    myStats {
      tickets {
        ingresados
        asignados
        resueltos
        cerrados
      }
      vacaciones {
        dias_disponibles
        dias_usados
      }
      zonas_a_cargo
      grafico_mensual {
        mes
        tickets
      }
    }
  }
`;

export interface GetMyStatsResponse {
  myStats: MyStats;
}
