import { gql } from 'graphql-request';
import { GetUserPerformanceResponse } from './types';

export const GET_USER_PERFORMANCE_QUERY = gql`
  query UserPerformance($fechaFin: String, $fechaInicio: String, $idDepartamento: Int, $idUsuario: Int, $periodo: RendimientoPeriodo) {
    userPerformance(fecha_fin: $fechaFin, fecha_inicio: $fechaInicio, id_departamento: $idDepartamento, id_usuario: $idUsuario, periodo: $periodo) {
      filtros_aplicados {
        fecha_inicio
        fecha_fin
        id_departamento
        id_usuario
        periodo
      }
      lista_usuarios {
        avatar
        tickets
        usuario
      }
      rows {
        id_usuario
        nombre
        departamento
        tickets_pendientes
        tickets_asignados
        tickets_resueltos
        porcentaje_efectividad
      }
    }
  }
`;

export type GetUserPerformanceResponseType = GetUserPerformanceResponse;
