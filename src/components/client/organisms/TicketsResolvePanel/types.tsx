import { DonutChartDataItem } from "../../atoms/DonutChart/types";

/**
 * Props del componente TicketsResolvePanel
 */
export interface TicketsResolvePanelProps {
  /**
   * Datos para el gráfico de dona (tickets resueltos por categoría/tipo)
   */
  data: DonutChartDataItem[];

  /**
   * Tamaño del gráfico en píxeles
   * @default 250
   */
  size?: number;

  /**
   * Grosor del anillo de la dona
   * @default 30
   */
  strokeWidth?: number;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
