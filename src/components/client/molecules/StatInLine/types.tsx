/**
 * Tipos predefinidos de estadísticas
 */
export type StatInLineType = "resolved" | "assigned" | "in-progress";

/**
 * Tamaños disponibles
 */
export type StatInLineSize = "small" | "medium";

/**
 * Configuración de colores para cada tipo predefinido
 */
export const STAT_INLINE_CONFIG: Record<StatInLineType, { color: string }> = {
  resolved: {
    color: "#AACC00",
  },
  assigned: {
    color: "#FB8500",
  },
  "in-progress": {
    color: "#FFB703",
  },
};

/**
 * Props cuando se usa un tipo predefinido
 */
interface StatInLinePropsWithType {
  /**
   * Tipo predefinido de estadística
   */
  type: StatInLineType;

  /**
   * Texto del label (ej: "Asignados", "Resueltos")
   */
  label: string;

  /**
   * Valor numérico a mostrar
   */
  value: number;

  /**
   * Tamaño del componente
   * @default "small"
   */
  size?: StatInLineSize;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;

  /**
   * No se permite color cuando se usa type
   */
  color?: never;
}

/**
 * Props cuando se usa color personalizado
 */
interface StatInLinePropsCustom {
  /**
   * Texto del label (ej: "Asignados", "Resueltos")
   */
  label: string;

  /**
   * Valor numérico a mostrar
   */
  value: number;

  /**
   * Color personalizado del valor (ej: "#AACC00")
   */
  color: string;

  /**
   * Tamaño del componente
   * @default "small"
   */
  size?: StatInLineSize;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;

  /**
   * No se permite type cuando se usa color personalizado
   */
  type?: never;
}

/**
 * Props del componente StatInLine (admite ambas formas)
 */
export type StatInLineProps = StatInLinePropsWithType | StatInLinePropsCustom;
