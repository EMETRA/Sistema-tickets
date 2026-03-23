import { gql } from 'graphql-request';
import { GetAdminDashboardStatsResponse } from './types';

export const GET_ADMIN_DASHBOARD_STATS_QUERY = gql`
  query adminDashboardStats($fecha_inicio: String, $fecha_fin: String, $id_departamento: Int) {
    adminDashboardStats(fecha_inicio: $fecha_inicio, fecha_fin: $fecha_fin, id_departamento: $id_departamento) {
      filtros_aplicados {
        fecha_inicio
        fecha_fin
        id_departamento
      }
      totales {
        ingresados
        resueltos
        en_trabajo
        asignados
      }
      por_estado {
        estado
        cantidad
      }
      grafico_resueltos_mensual {
        mes
        cantidad
      }
    }
  }
`;

export type GetAdminDashboardStatsResponseType = GetAdminDashboardStatsResponse;
