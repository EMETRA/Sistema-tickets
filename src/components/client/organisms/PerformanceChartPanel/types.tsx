import { BarChartDataPoint } from "../../atoms/BarChart/types";
import { ToggleButtonOption } from "../../atoms/ToggleButton/types";

/**
 * Variantes del panel de rendimiento
 */
export type PerformanceChartVariant = "primary" | "secondary";

/**
 * Filtros disponibles para la variante primary
 */
export type PrimaryFilter = "ANUAL" | "MENSUAL" | "SEMANAL" | "HOY";

/**
 * Estructura de filtros para la variante secondary
 * Cada filtro padre tiene sus propios filtros hijos
 */
export interface SecondaryFilterConfig {
  /**
   * Opciones del filtro padre
   */
  parentOptions: ToggleButtonOption[];

  /**
   * Opciones de filtros hijos por cada valor del padre
   * La clave es el valor del padre, el valor es el array de opciones hijas
   */
  childOptionsByParent: Record<string, ToggleButtonOption[]>;
}

/**
 * Props base del componente
 */
interface BasePerformanceChartPanelProps {
  /**
   * Variante del panel
   */
  variant: PerformanceChartVariant;

  /**
   * Datos para el gráfico de barras
   */
  data: BarChartDataPoint[];

  /**
   * Ancho del gráfico
   * @default 700
   */
  width?: number;

  /**
   * Alto del gráfico
   * @default 400
   */
  height?: number;

  /**
   * Clase CSS adicional
   */
  className?: string;
}

/**
 * Props para variante primary
 */
export interface PrimaryPerformanceChartPanelProps extends BasePerformanceChartPanelProps {
  variant: "primary";

  /**
   * Filtro seleccionado actualmente
   */
  selectedFilter: PrimaryFilter;

  /**
   * Callback cuando cambia el filtro
   */
  onFilterChange: (filter: PrimaryFilter) => void;
}

/**
 * Props para variante secondary
 */
export interface SecondaryPerformanceChartPanelProps extends BasePerformanceChartPanelProps {
  variant: "secondary";

  /**
   * Configuración de filtros padre e hijos
   */
  filterConfig: SecondaryFilterConfig;

  /**
   * Filtro padre seleccionado actualmente
   */
  selectedParentFilter: string;

  /**
   * Filtro hijo seleccionado actualmente
   */
  selectedChildFilter: string;

  /**
   * Callback cuando cambia el filtro padre
   */
  onParentFilterChange: (filter: string) => void;

  /**
   * Callback cuando cambia el filtro hijo
   */
  onChildFilterChange: (filter: string) => void;
}

/**
 * Union type de todas las props posibles
 */
export type PerformanceChartPanelProps =
  | PrimaryPerformanceChartPanelProps
  | SecondaryPerformanceChartPanelProps;
