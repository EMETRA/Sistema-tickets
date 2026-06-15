import { IconName } from "../../atoms/Icon/types";

/**
 * Opción de filtro con ícono
 */
export interface FilterOption {
  /**
   * Etiqueta visible del filtro
   */
  label: string;

  /**
   * Valor único del filtro
   */
  value: string;

  /**
   * Nombre del ícono a mostrar
   */
  icon: IconName;
}

/**
 * Props del componente IconFilterTabs
 */
export interface IconFilterTabsProps {
  /**
   * Opciones de filtro adicionales
   * La opción "Todos" se agrega automáticamente al inicio
   */
  options?: FilterOption[];

  /**
   * Valor del filtro seleccionado actualmente
   */
  value: string;

  /**
   * Callback cuando cambia la selección
   */
  onChange: (value: string) => void;

  /**
   * Si el componente está deshabilitado
   * @default false
   */
  disabled?: boolean;

  /**
   * Clase CSS adicional
   */
  className?: string;
}
