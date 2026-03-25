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

// ========================================
// RESPONSES PARA MUTATIONS (Lógico & Necesario)
// ========================================

/**
 * Respuesta estándar del backend para operaciones RBAC
 */
export interface OperationResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp: string;
}

export interface CreateRolResponse {
  createRol: OperationResponse;
}

export interface UpdateRolResponse {
  updateRol: OperationResponse;
}

export interface AssignPermissionResponse {
  assignPermission: OperationResponse;
}

export interface CreateModuleResponse {
  createModule: OperationResponse;
}

// ========================================
// INPUTS PARA MUTATIONS
// ========================================

export interface CreateModuleInput {
  nombre: string;
  ruta: string;
  descripcion?: string;
  icono?: string;
}

export interface UpdateRolInput {
  nombre_rol?: string;
  descripcion?: string;
}