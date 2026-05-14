import { gql } from 'graphql-request';
import { GetTeamMembersResponse } from './types';

export const GET_TEAM_MEMBERS_QUERY = gql`
  query TeamMembers($idDepartamento: Int, $idRol: Int, $limit: Int, $search: String) {
    teamMembers(id_departamento: $idDepartamento, id_rol: $idRol, limit: $limit, search: $search) {
      email
      avatar
      id_usuario
      nombre
      departamento
      rol
      tickets_asignados
      tickets_resueltos
      tickets_pendientes
    }
  }
`;

export type GetTeamMembersResponseType = GetTeamMembersResponse;
