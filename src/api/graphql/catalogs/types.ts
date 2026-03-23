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
