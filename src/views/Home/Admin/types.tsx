import { TicketStatData } from "@/components/client/organisms/DashboardStatsBar";
import { EventItemProps } from "@/components/client/molecules/EventItem";
import { BarChartDataPoint } from "@/components/client/atoms/BarChart";
import { DonutChartDataItem } from "@/components/client/atoms/DonutChart";
import { TicketData } from "@/components/client/organisms/TicketsPanel";

/**
 * Props para página de Home para Administrador
 */
export interface AdminHomeProps {
  /**
   * Datos estadísticos para mostrar el Ticket Stat
   */
  ticketStats: TicketStatData[];
  
  /**
   * Datos para el gráfico de rendimiento
  */
  performanceData: BarChartDataPoint[];
 
  /**
  * Datos para los paneles de información
  */
  eventsInfoPanel: EventItemProps[];

  /**
   * Datos para el gráfico de tickets resueltos
   */
  resolvedTicketsData: DonutChartDataItem[];
  
  /**
   * Lista de tickets para mostrar en el panel de tickets
   */
  tickets: TicketData[];
}