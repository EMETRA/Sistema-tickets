import { FilterOption } from "../../molecules/IconFilterTabs/types";

/**
 * Props del componente TicketsFilterBar
 */
export interface TicketsFilterBarProps {
  /**
   * Opciones de filtro adicionales para IconFilterTabs
   * La opción "Todos" se agrega automáticamente
   */
  filterOptions?: FilterOption[];

  /**
   * Valor del filtro seleccionado actualmente
   */
  selectedFilter: string;

  /**
   * Callback cuando cambia el filtro
   */
  onFilterChange: (value: string) => void;

  /**
   * Callback cuando se presiona el botón Exportar
   */
  onExport: () => void;

  /**
   * Si los controles están deshabilitados
   * @default false
   */
  disabled?: boolean;

  /**
   * Clase CSS adicional
   */
  className?: string;
}
