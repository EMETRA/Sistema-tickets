export interface DonutChartDataItem {
  /**
   * Título del item en la leyenda
   */
  label: string;
  
  /**
   * Valor numérico del item
   */
  value: number;
  
  /**
   * Color del segmento (opcional, se asignará automáticamente si no se proporciona)
   */
  color?: string;
}

export interface DonutChartProps {
  /**
   * Array de datos para la gráfica de dona
   */
  data: DonutChartDataItem[];
  
  /**
   * Tamaño de la gráfica en píxeles
   * @default 200
   */
  size?: number;
  
  /**
   * Grosor del anillo de la dona
   * @default 40
   */
  strokeWidth?: number;
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}
