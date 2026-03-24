// ========================================
// QUERIES - Lista y Detalles
// ========================================
export { GET_TICKETS_QUERY } from './getTickets';
export { GET_TICKET_BY_ID_QUERY } from './ticketById';

// ========================================
// QUERIES - Comentarios, Historial, Adjuntos, Tags
// ========================================
export { GET_TICKET_COMMENTS_QUERY } from './ticketComments';
export { GET_TICKET_HISTORY_QUERY } from './ticketHistory';
export { GET_TICKET_ATTACHMENTS_QUERY } from './ticketAttachments';
export { GET_TICKET_TAGS_QUERY } from './ticketTags';

// ========================================
// QUERIES - Catálogos (Categories, Priorities, Statuses, Tags)
// ========================================
export { GET_TICKET_CATEGORIES_QUERY } from './ticketCategories';
export { GET_TICKET_PRIORITIES_QUERY } from './ticketPriorities';
export { GET_TICKET_STATUSES_QUERY } from './ticketStatuses';
export { GET_TICKET_TAG_CATALOG_QUERY } from './ticketTagCatalog';

// ========================================
// TYPES - All types centralized (DRY)
// ========================================
export type {
    // Ticket
    Ticket,
    TicketFilterInput,
    GetTicketsResponse,
    GetTicketByIdResponse,
    // Comments
    TicketComentario,
    GetTicketCommentsResponse,
    // History
    TicketHistorial,
    GetTicketHistoryResponse,
    // Attachments
    TicketAdjunto,
    GetTicketAttachmentsResponse,
    // Tags
    TicketTag,
    GetTicketTagsResponse,
    // Catalogs
    TicketCategoria,
    GetTicketCategoriesResponse,
    TicketPrioridad,
    GetTicketPrioritiesResponse,
    TicketEstado,
    GetTicketStatusesResponse,
    GetTicketTagCatalogResponse,
} from './types';

// TODO: Mutations (próximas fases)
// export { CREATE_TICKET_MUTATION } from './createTicket';
// export { UPDATE_TICKET_MUTATION } from './updateTicket';
// export { DELETE_TICKET_MUTATION } from './deleteTicket';
