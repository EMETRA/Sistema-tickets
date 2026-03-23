export { useLogin, type LoginState } from './useLogin';
export { useGetTickets } from './useGetTickets';
export { useMutation, type MutationState, type UseMutationOptions } from './useMutation';

// Home hooks
export { useGetUser } from './useGetUser';
export { useGetPerfilEquipo } from './useGetPerfilEquipo';
export { useGetMyStats } from './useGetMyStats';
export { useGetAppsByRole } from './useGetAppsByRole';

// Technician hooks
export { useGetTechnicianEvents } from './useGetTechnicianEvents';
export { useGetTechnicianLastTickets } from './useGetTechnicianLastTickets';
export { useGetTechnicianStats } from './useGetTechnicianStats';
export { useGetMyActivity } from './useGetMyActivity';
export { useGetAnnualReport } from './useGetAnnualReport';

// Catalogs hooks - Categories, Priorities, Statuses
export { useGetCategories } from './useGetCategories';
export { useGetPriorities } from './useGetPriorities';
export { useGetStatuses } from './useGetStatuses';

// Admin Dashboard hooks
export { useGetAdminDashboardStats } from './useGetAdminDashboardStats';
export { useGetUserPerformance } from './useGetUserPerformance';
export { useGetTeamMembers } from './useGetTeamMembers';
export { useGetLastTicket } from './useGetLastTicket';
export { useGetLastMovements } from './useGetLastMovements';

// Configuration hooks
export { useGetPendingRequests } from './useGetPendingRequests';

// RBAC hooks
export { useGetRoles } from './useGetRoles';

// Tickets hooks - Details, Comments, History, Attachments, Tags
export { useGetTicketById } from './useGetTicketById';
export { useGetTicketComments } from './useGetTicketComments';
export { useGetTicketHistory } from './useGetTicketHistory';
export { useGetTicketAttachments } from './useGetTicketAttachments';
export { useGetTicketTags } from './useGetTicketTags';

// Tickets hooks - Catalogs
export { useGetTicketCategories } from './useGetTicketCategories';
export { useGetTicketPriorities } from './useGetTicketPriorities';
export { useGetTicketStatuses } from './useGetTicketStatuses';
export { useGetTicketTagCatalog } from './useGetTicketTagCatalog';
