/**
 * Configuration System Types
 * Includes pending requests and system configuration structures
 */

// ===== PENDING REQUESTS =====
export interface PendingRequestRow {
  id_solicitud: number;
  id_usuario: number;
  nombre?: string;
  email?: string;
  departamento?: string;
  tipo: string;
  detalle: string;
  estado?: string;
  budget?: number;
  position?: string;
  fecha: string;
}

export interface GetPendingRequestsResponse {
  pendingRequests: PendingRequestRow[];
}

/**
 * Respuesta estándar para operaciones de configuración
 */
export interface OperationResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp: string;
}

export interface AproveRequestResponse {
  aproveRequest: OperationResponse;
}

export interface RequestPermissionResponse {
  requestPermission: OperationResponse;
}

export interface ModuleRow {
  id_modulo: number;
  nombre: string;
  descripcion?: string;
  estado: string;
}

export interface GetModulesResponse {
  modules: ModuleRow[];
}

// ===== PERMISSIONS =====
export interface PermissionRow {
  id_permiso: number;
  nombre: string;
  id_modulo: number;
  codigo: string;
  descripcion?: string;
  estado: string;
  ver: boolean;
  grabar: boolean;
  editar: boolean;
  eliminar: boolean;
}

export interface GetPermissionsResponse {
  permissions: PermissionRow[];
}

// ===== ROLES =====
export interface RoleRowExtended {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  estado: string;
  codigo_rol?: string;
  permisos: PermissionRow[];
}

export interface GetRolesExtendedResponse {
  roles: RoleRowExtended[];
}

// ===== ENROLLS =====
export interface EnrollRow {
  id_asignacion: number;
  nombre: string;
  departamento: string;
  numero_empleado: string;
  permiso: string;
  estado: string;
}

export interface GetEnrollsResponse {
  enrolls: EnrollRow[];
}
