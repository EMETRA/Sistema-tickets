/**
 * Módulo Technician (Home Técnico) - Exports
 */

// Query Definitions
export { GET_TECHNICIAN_EVENTS_QUERY, type GetTechnicianEventsResponse } from "./technicianEvents";
export { GET_TECHNICIAN_LAST_TICKETS_QUERY, type GetTechnicianLastTicketsResponse } from "./technicianLastTickets";
export { GET_TECHNICIAN_STATS_QUERY, type GetTechnicianStatsResponse } from "./technicianStats";
export { GET_MY_ACTIVITY_QUERY, type GetMyActivityResponse } from "./myActivity";
export { GET_ANNUAL_REPORT_QUERY, type GetAnnualReportResponse } from "./annualReport";

// Types
export type {
    TechnicianEventRow,
    TechnicianTicketRow,
    TechnicianStatsPoint,
    TechnicianStats,
    ActivityRow,
    AnnualReportPoint,
    AnnualReport,
    TechnicianEventsFilters,
    TechnicianLastTicketsFilters,
    TechnicianStatsFilters,
    MyActivityFilters,
    AnnualReportFilters,
} from "./types";
