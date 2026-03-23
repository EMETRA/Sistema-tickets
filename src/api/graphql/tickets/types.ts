/**
 * Filtros para filtrar tickets
 * Todos los filtros son opcionales
 */
export interface TicketFilterInput {
  categoriaId?: number;
  estadoId?: number;
  prioridadId?: number;
  usuarioAsignadoId?: number;
}

/**
 * Estructura de un ticket individual
 */
export interface Ticket {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  tiempoEstimado: number;
  usuarioCreadorId: string;
  usuarioAsignadoId: string | null;
  categoriaId: string;
  prioridadId: string;
  estadoId: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCierre: string | null;
}

/**
 * Respuesta de la query GetTickets
 */
export interface GetTicketsResponse {
  tickets: Ticket[];
}

// ========================================
// COMENTARIOS DE TICKET
// ========================================

export interface TicketComentario {
  id: string;
  ticketId: number;
  usuarioId: number;
  comentario: string;
  esInterno: number;
  fecha: string;
}

export interface GetTicketCommentsResponse {
  ticketComments: TicketComentario[];
}

// ========================================
// HISTORIAL DE TICKET
// ========================================

export interface TicketHistorial {
  id: string;
  ticketId: number;
  usuarioId: number;
  accion: string;
  valorAnterior: string | null;
  valorNuevo: string | null;
  fecha: string;
}

export interface GetTicketHistoryResponse {
  ticketHistory: TicketHistorial[];
}

// ========================================
// ADJUNTOS DE TICKET
// ========================================

export interface TicketAdjunto {
  id: string;
  ticketId: number;
  usuarioId: number;
  nombreArchivo: string | null;
  keyStorage: string | null;
  fecha: string;
}

export interface GetTicketAttachmentsResponse {
  ticketAttachments: TicketAdjunto[];
}

// ========================================
// TAGS DE TICKET
// ========================================

export interface TicketTag {
  id: string;
  nombre: string;
  color: string | null;
}

export interface GetTicketTagsResponse {
  ticketTags: TicketTag[];
}

// ========================================
// CATÁLOGOS
// ========================================

export interface TicketCategoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: number;
}

export interface GetTicketCategoriesResponse {
  ticketCategories: TicketCategoria[];
}

export interface TicketPrioridad {
  id: string;
  nombre: string;
  nivel: number;
  color: string | null;
}

export interface GetTicketPrioritiesResponse {
  ticketPriorities: TicketPrioridad[];
}

export interface TicketEstado {
  id: string;
  nombre: string;
  esFinal: number;
}

export interface GetTicketStatusesResponse {
  ticketStatuses: TicketEstado[];
}

export interface GetTicketTagCatalogResponse {
  ticketTagCatalog: TicketTag[];
}

// ========================================
// TICKET POR ID
// ========================================

export interface GetTicketByIdResponse {
  ticket: Ticket | null;
}
