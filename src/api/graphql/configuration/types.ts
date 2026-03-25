/**
 * Configuration System Types
 * Includes pending requests and system configuration structures
 */

export interface PendingRequestRow {
  id_solicitud: number;
  id_usuario: number;
  tipo: string;
  detalle: string;
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
