import { gql } from 'graphql-request';
import { GetUserPerformanceResponse } from './types';

export const GET_USER_PERFORMANCE_QUERY = gql`
  query userPerformance($fecha_inicio: String, $fecha_fin: String, $id_departamento: Int, $id_usuario: Int) {
    userPerformance(fecha_inicio: $fecha_inicio, fecha_fin: $fecha_fin, id_departamento: $id_departamento, id_usuario: $id_usuario) {
      filtros_aplicados {
        fecha_inicio
        fecha_fin
        id_departamento
        id_usuario
      }
      rows {
        id_usuario
        nombre
        departamento
        tickets_asignados
        tickets_resueltos
        porcentaje_efectividad
      }
    }
  }
`;

export type GetUserPerformanceResponseType = GetUserPerformanceResponse;
