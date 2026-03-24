// Admin Dashboard Types

export interface AdminDashboardFilters {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  id_departamento?: number | null;
}

export interface AdminDashboardTotals {
  ingresados: number;
  resueltos: number;
  en_trabajo: number;
  asignados: number;
}

export interface AdminDashboardEstadoRow {
  estado: string;
  cantidad: number;
}

export interface AdminDashboardMonthlyResolvedPoint {
  mes: string;
  cantidad: number;
}

export interface AdminDashboardStats {
  filtros_aplicados: AdminDashboardFilters;
  totales: AdminDashboardTotals;
  por_estado: AdminDashboardEstadoRow[];
  grafico_resueltos_mensual: AdminDashboardMonthlyResolvedPoint[];
}

export interface GetAdminDashboardStatsResponse {
  adminDashboardStats: AdminDashboardStats;
}

export interface UserPerformanceFilters {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  id_departamento?: number | null;
  id_usuario?: number | null;
}

export interface UserPerformanceRow {
  id_usuario: number;
  nombre?: string | null;
  departamento?: string | null;
  rol?: string | null;
  tickets_asignados: number;
  tickets_resueltos: number;
  porcentaje_efectividad: number;
}

export interface UserPerformanceResponse {
  filtros_aplicados: UserPerformanceFilters;
  rows: UserPerformanceRow[];
}

export interface GetUserPerformanceResponse {
  userPerformance: UserPerformanceResponse;
}

export interface TeamMemberRow {
  id_usuario: number;
  nombre?: string | null;
  departamento?: string | null;
  rol?: string | null;
  tickets_asignados: number;
  tickets_resueltos: number;
  tickets_pendientes: number;
}

export interface GetTeamMembersResponse {
  teamMembers: TeamMemberRow[];
}

export interface TicketSummaryRow {
  id_ticket: number;
  codigo?: string | null;
  titulo: string;
  categoria: number;
  prioridad: number;
  estado: number;
  creador: number;
  asignado?: number | null;
  fecha_creacion: string;
}

export interface GetLastTicketResponse {
  lastTicket: TicketSummaryRow[];
}

export interface MovementRow {
  tipo: string;
  ticket_codigo?: string | null;
  usuario: string;
  detalle: string;
  fecha: string;
}

export interface GetLastMovementsResponse {
  lastMovements: MovementRow[];
}
