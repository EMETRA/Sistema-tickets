// Catalog Types

export interface TicketCategoria {
  id: string | number;
  nombre: string;
  descripcion?: string | null;
  activo: number;
}

export interface GetCategoriesResponse {
  ticketCategories: TicketCategoria[];
}

export interface TicketPrioridad {
  id: string | number;
  nombre: string;
  nivel: number;
  color?: string | null;
}

export interface GetPrioritiesResponse {
  ticketPriorities: TicketPrioridad[];
}

export interface TicketEstado {
  id: string | number;
  nombre: string;
  esFinal: number;
}

export interface GetStatusesResponse {
  ticketStatuses: TicketEstado[];
}

// ========================================
// INPUTS DE CATÁLOGOS
// ========================================

export interface CreateCategoryInput {
  nombre: string;
  descripcion?: string;
  activo?: number; // 1 (activo) o 0 (inactivo)
}

export interface CreatePriorityInput {
  nombre: string;
  nivel: number;
  color?: string;
}

export interface CreateStatusInput {
  nombre: string;
  es_final?: number; // 1 o 0
}

// ========================================
// RESPONSES DE CATÁLOGOS
// ========================================

/**
 * Respuesta estándar para operaciones de creación en catálogos
 */
export interface OperationResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  timestamp: string;
}

export interface CreateCategoryResponse {
  createCategory: OperationResponse;
}

export interface CreatePriorityResponse {
  createPriority: OperationResponse;
}

export interface CreateStatusResponse {
  createStatus: OperationResponse;
}
