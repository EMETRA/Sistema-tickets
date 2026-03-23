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
