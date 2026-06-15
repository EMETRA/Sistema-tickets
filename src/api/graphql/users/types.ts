/**
 * Types para Users
 */
export interface  User {
  avatar?: string | null;
  email: string;
  id: string;
  name: string;
  status: string;
  rol: string | null;
  departamento: string | null;
}

export interface GetUsersResponse {
  users: User[];
}
