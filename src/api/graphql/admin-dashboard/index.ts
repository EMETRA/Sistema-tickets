// Admin Dashboard - Types
export type {
    AdminDashboardFilters,
    AdminDashboardTotals,
    AdminDashboardEstadoRow,
    AdminDashboardMonthlyResolvedPoint,
    AdminDashboardStats,
    GetAdminDashboardStatsResponse,
    UserPerformanceFilters,
    UserPerformanceRow,
    UserPerformanceResponse,
    GetUserPerformanceResponse,
    TeamMemberRow,
    GetTeamMembersResponse,
    TicketSummaryRow,
    GetLastTicketResponse,
    MovementRow,
    GetLastMovementsResponse,
} from './types';

// Admin Dashboard - Queries
export {
    GET_ADMIN_DASHBOARD_STATS_QUERY,
    type GetAdminDashboardStatsResponseType,
} from './adminDashboardStats';
export {
    GET_USER_PERFORMANCE_QUERY,
    type GetUserPerformanceResponseType,
} from './userPerformance';
export {
    GET_TEAM_MEMBERS_QUERY,
    type GetTeamMembersResponseType,
} from './teamMembers';
export {
    GET_LAST_TICKET_QUERY,
    type GetLastTicketResponseType,
} from './lastTicket';
export {
    GET_LAST_MOVEMENTS_QUERY,
    type GetLastMovementsResponseType,
} from './lastMovements';
