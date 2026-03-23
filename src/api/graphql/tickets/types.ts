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
