export interface LineChartDataPoint {
  /**
   * Etiqueta del eje X
   */
  label: string;
  
  /**
   * Valor del eje Y
   */
  value: number;
}

export interface LineChartProps {
  /**
   * Array de puntos de datos para la gráfica
   */
  data: LineChartDataPoint[];
  
  /**
   * Ancho de la gráfica en píxeles
   * @default 600
   */
  width?: number;
  
  /**
   * Alto de la gráfica en píxeles
   * @default 300
   */
  height?: number;
  
  /**
   * Mostrar la grilla
   * @default true
   */
  showGrid?: boolean;
  
  /**
   * Color de la línea
   * @default "#54C8E8" (celeste-1)
   */
  lineColor?: string;
  
  /**
   * Color del área bajo la línea
   * @default "#B7EBF7" (celeste-10)
   */
  areaColor?: string;
  
  /**
   * Grosor de la línea
   * @default 2
   */
  strokeWidth?: number;
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}
