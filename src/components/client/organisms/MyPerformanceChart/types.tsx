import { LineChartDataPoint } from "../../atoms/LineChart";

export interface MyPerformanceChartProps {
  /**
   * Array de puntos de datos para la gráfica de rendimiento
   */
  data: LineChartDataPoint[];
}