export interface BarChartDataPoint {
  /**
   * Etiqueta en el eje X
   */
  label: string;
  
  /**
   * Valor de la barra
   */
  value: number;
  
  /**
   * Color personalizado de la barra (opcional)
   */
  color?: string;
}

export type BarChartColorScheme = 
  | "green-gradient"      // Verde oscuro a amarillo
  | "blue-gradient"       // Celeste a morado/rosa
  | "single"             // Un solo color
  | "multi-color";       // Colores variados

export interface BarChartProps {
  /**
   * Array de datos para las barras
   */
  data: BarChartDataPoint[];
  
  /**
   * Ancho de la gráfica en píxeles
   * @default 700
   */
  width?: number;
  
  /**
   * Alto de la gráfica en píxeles
   * @default 400
   */
  height?: number;
  
  /**
   * Barras con bordes muy redondeados (25px) vs normal (10px)
   * @default false
   */
  rounded?: boolean;
  
  /**
   * Mostrar grid completo (horizontal y vertical)
   * @default false (solo horizontal)
   */
  showFullGrid?: boolean;
  
  /**
   * Labels del eje X en vertical
   * @default false (horizontal)
   */
  verticalLabels?: boolean;
  
  /**
   * Esquema de colores a usar
   * @default "blue-gradient"
   */
  colorScheme?: BarChartColorScheme;
  
  /**
   * Color único cuando colorScheme es "single"
   */
  singleColor?: string;
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}
