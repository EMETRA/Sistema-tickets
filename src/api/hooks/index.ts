export { useLogin, type LoginState } from './useLogin';
export { useGetTickets } from './useGetTickets';
export { useTicketsByRole } from './useTicketsByRole';
export { useMutation, type MutationState, type UseMutationOptions } from './useMutation';

// Home hooks
export { useGetUser } from './useGetUser';
export { useGetPerfilEquipo } from './useGetPerfilEquipo';
export { useGetMyStats } from './useGetMyStats';
export { useGetAppsByRole } from './useGetAppsByRole';
export { useGetUsers } from './useGetUsers';
export { useGetUserById } from './useGetUserById';

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
export { useGetAdminDashboardStats, type AdminDashboardStatsOptions } from './useGetAdminDashboardStats';
export { useGetUserPerformance, type UserPerformanceOptions } from './useGetUserPerformance';
export { useGetTeamMembers } from './useGetTeamMembers';
export { useGetLastTicket } from './useGetLastTicket';
export { useGetLastMovements } from './useGetLastMovements';

// Configuration hooks
export { useGetPendingRequests } from './useGetPendingRequests';
export { useAproveRequest } from './useAproveRequest';
export { useRequestPermission } from './useRequestPermission';
export { useGetModules } from './useGetModules';
export { useGetPermissions } from './useGetPermissions';
export { useGetEnrolls } from './useGetEnrolls';

// MOD05 - Reporte RRHH hooks
export { useGetReporteRhCamposDisponibles } from './useGetReporteRhCamposDisponibles';
export { useGetReporteRhEstatusOpciones } from './useGetReporteRhEstatusOpciones';
export { useGetReporteRhResultados } from './useGetReporteRhResultados';
export { useGetReporteRhExportExcel } from './useGetReporteRhExportExcel';

// MOD06 - Funciones por usuario
export { useGetFuncionesPorUsuarioAplicaciones } from './useGetFuncionesPorUsuarioAplicaciones';
export { useGetFuncionesPorUsuarioEmpresas } from './useGetFuncionesPorUsuarioEmpresas';
export { useGetFuncionesPorUsuarioUsuarios } from './useGetFuncionesPorUsuarioUsuarios';
export { useGetFuncionesPorUsuarioPermisos } from './useGetFuncionesPorUsuarioPermisos';

// MOD07 - Manuales hooks
export { useGetManualesCategorias } from './useGetManualesCategorias';
export { useGetManualesDisponibles } from './useGetManualesDisponibles';
export { useGetManualesAgrupados } from './useGetManualesAgrupados';
export { useGetManual } from './useGetManual';

// RBAC hooks
export { useGetRoles } from './useGetRoles';
export { useCreateRol } from './useCreateRol';
export { useUpdateRol } from './useUpdateRol';
export { useAssignPermission } from './useAssignPermission';
export { useCreateModule } from './useCreateModule';

// Tickets hooks - Details, Comments, History, Attachments, Tags, Messages
export { useGetTicketById } from './useGetTicketById';
export { useGetTicketsByUserId } from './useGetTicketsByUserId';
export { useGetTicketComments } from './useGetTicketComments';
export { useGetTicketHistory } from './useGetTicketHistory';
export { useGetTicketAttachments } from './useGetTicketAttachments';
export { useGetTicketTags } from './useGetTicketTags';
export { useGetTicketMessages } from './useGetTicketMessages';

// Tickets hooks - Mutations
export { useCreateTicket } from './useCreateTicket';
export { useUpdateTicket } from './useUpdateTicket';
export { useDeleteTicket } from './useDeleteTicket';
export { useAddTicketComment } from './useAddTicketComment';
export { useSendTicketMessage } from './useSendTicketMessage';

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

///////// APPS HOOKS //////////

// MOD10 - Apps hooks
export { useSendEmailNotification } from './useSendEmailNotification';

// PROC01 - Apps hooks
export { useExecuteLprRemission } from './useExecuteLprRemission';
