/**
 * Props del componente ProgressRingStat
 */
export interface ProgressRingStatProps {
  /**
   * Texto del label que aparece debajo del anillo
   */
  label: string;

  /**
   * Porcentaje de progreso (0-100)
   */
  percentage: number;

  /**
   * Tamaño del anillo en píxeles
   * @default 180
   */
  size?: number;

  /**
   * Grosor del anillo
   * @default 20
   */
  strokeWidth?: number;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
