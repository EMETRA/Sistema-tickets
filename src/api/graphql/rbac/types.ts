/**
 * RBAC (Role-Based Access Control) Types
 * Includes roles, permissions, and module structures
 */

export interface RoleRow {
  id_rol: number;
  nombre_rol: string;
  descripcion?: string;
}

export interface GetRolesResponse {
  roles: RoleRow[];
}
