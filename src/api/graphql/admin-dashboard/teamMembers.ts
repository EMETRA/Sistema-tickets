import { gql } from 'graphql-request';
import { GetTeamMembersResponse } from './types';

export const GET_TEAM_MEMBERS_QUERY = gql`
  query teamMembers($id_departamento: Int, $id_rol: Int, $search: String, $limit: Int) {
    teamMembers(id_departamento: $id_departamento, id_rol: $id_rol, search: $search, limit: $limit) {
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
