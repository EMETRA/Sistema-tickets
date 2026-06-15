import { TicketStatType } from "../../molecules/TicketStat/types";

/**
 * Datos de una estadística individual de ticket
 */
export interface TicketStatData {
  /**
   * Tipo predefinido de estadística
   */
  type: TicketStatType;

  /**
   * Texto del título
   */
  label: string;

  /**
   * Número de tickets
   */
  value: number;
}

/**
 * Props del componente DashboardStatsBar
 */
export interface DashboardStatsBarProps {
  /**
   * Array de estadísticas de tickets a mostrar
   */
  stats: TicketStatData[];

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
