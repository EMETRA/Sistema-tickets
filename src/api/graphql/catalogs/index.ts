// Catalogs - Types
export type {
    TicketCategoria,
    GetCategoriesResponse,
    TicketPrioridad,
    GetPrioritiesResponse,
    TicketEstado,
    GetStatusesResponse,
    CreateCategoryInput,
    CreatePriorityInput,
    CreateStatusInput,
    CreateCategoryResponse,
    CreatePriorityResponse,
    CreateStatusResponse,
} from './types';

// Catalogs - Queries
export { GET_CATEGORIES_QUERY, type GetCategoriesResponseType } from './categories';
export { GET_PRIORITIES_QUERY, type GetPrioritiesResponseType } from './priorities';
export { GET_STATUSES_QUERY, type GetStatusesResponseType } from './statuses';

// Catalogs - Mutations
export { CREATE_CATEGORY_MUTATION } from './createCategory';
export { CREATE_PRIORITY_MUTATION } from './createPriority';
export { CREATE_STATUS_MUTATION } from './createStatus';