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
// MENSAJES DE TICKET (CHAT)
// ========================================

export interface TicketChatMessage {
  archivos: TicketAdjunto[];
  fechaEnvio: string;
  textoMensaje: string;
  usuario: number;
}

export interface GetTicketMessagesResponse {
  ticketMessages: TicketChatMessage[];
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


// ========================================
// INTERFACES PARA MUTACIONES DE TICKET
// ========================================
export interface CreateTicketInput {
  titulo: string;
  descripcion: string;
  usuarioCreadorId: number;
  usuarioAsignadoId?: number;
  categoriaId: number;
  prioridadId: number;
  estadoId: number;
  tiempoEstimado?: number;
  codigo?: string;
}
export interface UpdateTicketInput {
  titulo?: string;
  descripcion?: string;
  usuarioAsignadoId?: number;
  categoriaId?: number;
  prioridadId?: number;
  estadoId?: number;
  tiempoEstimado?: number;
  codigo?: string;
}
export interface AddTicketCommentInput {
  ticketId: string;
  usuarioId: number;
  comentario: string;
  esInterno?: boolean;
}

// ========================================
// RESPUESTAS DE MUTACIONES DE TICKET
// ========================================

export interface CreateTicketResponse { createTicket: Ticket; [key: string]: unknown; }
export interface UpdateTicketResponse { updateTicket: Ticket; [key: string]: unknown; }
export interface DeleteTicketResponse { deleteTicket: boolean; [key: string]: unknown; }
export interface AddTicketCommentResponse { addTicketComment: TicketComentario; [key: string]: unknown; }

// ========================================
// TAGS DE TICKET
// ========================================

export interface CreateTicketTagResponse {
  createTicketTag: TicketTag;
}

export interface AddTagToTicketResponse {
  addTagToTicket: {
    ticketId: string;
    tagId: number;
  };
}

export interface RemoveTagFromTicketResponse {
  removeTagFromTicket: boolean;
}

// ========================================
// RESPONSES PARA MUTATIONS DE TAGS
// ========================================

/**
 * Respuesta al crear un nuevo Tag en el catálogo
 */
export interface CreateTicketTagResponse {
  createTicketTag: TicketTag;
}

/**
 * Respuesta al asignar un Tag a un Ticket específico
 * El backend devuelve un objeto con los IDs vinculados
 */
export interface AddTagToTicketResponse {
  addTagToTicket: {
    ticketId: string;
    tagId: number;
  };
}

/**
 * Respuesta al remover un Tag de un Ticket
 */
export interface RemoveTagFromTicketResponse {
  removeTagFromTicket: boolean;
}



