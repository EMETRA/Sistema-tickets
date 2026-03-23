// Catalogs - Types
export type {
    TicketCategoria,
    GetCategoriesResponse,
    TicketPrioridad,
    GetPrioritiesResponse,
    TicketEstado,
    GetStatusesResponse,
} from './types';

// Catalogs - Queries
export { GET_CATEGORIES_QUERY, type GetCategoriesResponseType } from './categories';
export { GET_PRIORITIES_QUERY, type GetPrioritiesResponseType } from './priorities';
export { GET_STATUSES_QUERY, type GetStatusesResponseType } from './statuses';
