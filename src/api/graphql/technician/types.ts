/**
 * Types para módulo Technician (Home Técnico)
 */

/**
 * Evento del técnico - Retornado por query TechnicianEvents
 */
export interface TechnicianEventRow {
    id_evento: string;
    titulo: string;
    fecha_inicio: string;
    fecha_fin?: string;
}

/**
 * Ticket del técnico - Retornado por query technicianLastTickets
 */
export interface TechnicianTicketRow {
    codigo: string;
    titulo: string;
    prioridad: number;
    estado: number;
    fecha_creacion: string;
}

/**
 * Punto de datos para gráfico de rendimiento del técnico
 */
export interface TechnicianStatsPoint {
    mes: string;
    resueltos: number;
}

/**
 * Estadísticas de desempeño del técnico
 */
export interface TechnicianStats {
    tickets: number;
    asignados: number;
    resueltos: number;
    pendientes: number;
    grafico_rendimiento: TechnicianStatsPoint[];
}

/**
 * Actividad del técnico - Retornado por query myActivity
 */
export interface ActivityRow {
    tipo: string;
    codigo_ticket?: string;
    descripcion: string;
    fecha: string;
}

/**
 * Punto de datos para reporte anual
 */
export interface AnnualReportPoint {
    mes: string;
    ticketsCreados: number;
}

/**
 * Reporte anual del técnico
 */
export interface AnnualReport {
    anio: number;
    data: AnnualReportPoint[];
}

/**
 * Inputs para filtros de TechnicianEvents
 */
export interface TechnicianEventsFilters {
    fecha_inicio?: string;
    fecha_fin?: string;
}

/**
 * Inputs para filtros de technicianLastTickets
 */
export interface TechnicianLastTicketsFilters {
    limit?: number;
}

/**
 * Inputs para filtros de technicianStats
 * rango: "anio" | "meses" | "semana"
 */
export interface TechnicianStatsFilters {
    rango?: string;
}

/**
 * Inputs para filtros de myActivity
 */
export interface MyActivityFilters {
    limit?: number;
}

/**
 * Inputs para annualReport (requerido)
 */
export interface AnnualReportFilters {
    anio: number;
}
