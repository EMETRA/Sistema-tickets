/**
 * Types para Users
 */
export interface User {
  avatar?: string | null;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}

export interface GetUsersResponse {
  users: User[];
}
