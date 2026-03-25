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
export { useAproveRequest } from './useAproveRequest';
export { useRequestPermission } from './useRequestPermission';

// RBAC hooks
export { useGetRoles } from './useGetRoles';
export { useCreateRol } from './useCreateRol';
export { useUpdateRol } from './useUpdateRol';
export { useAssignPermission } from './useAssignPermission';
export { useCreateModule } from './useCreateModule';

// Tickets hooks - Details, Comments, History, Attachments, Tags
export { useGetTicketById } from './useGetTicketById';
export { useGetTicketComments } from './useGetTicketComments';
export { useGetTicketHistory } from './useGetTicketHistory';
export { useGetTicketAttachments } from './useGetTicketAttachments';
export { useGetTicketTags } from './useGetTicketTags';

// Tickets hooks - Mutations
export { useCreateTicket } from './useCreateTicket';
export { useUpdateTicket } from './useUpdateTicket';
export { useDeleteTicket } from './useDeleteTicket';
export { useAddTicketComment } from './useAddTicketComment';

// Tickets hooks - Mutations - Tags
export { useAddTagToTicket } from './useAddTagToTicket';
export { useCreateTicketTag } from './useCreateTicketTag';
export { useRemoveTagFromTicket } from './useRemoveTagFromTicket';

// Tickets hooks - Catalogs
export { useGetTicketCategories } from './useGetTicketCategories';
export { useGetTicketPriorities } from './useGetTicketPriorities';
export { useGetTicketStatuses } from './useGetTicketStatuses';
export { useGetTicketTagCatalog } from './useGetTicketTagCatalog';
export { useCreateCategory } from './useCreateCategory';
export { useCreatePriority } from './useCreatePriority';
export { useCreateStatus } from './useCreateStatus';



