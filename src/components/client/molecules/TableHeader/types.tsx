import { IconName } from "../../atoms/Icon/types";

/**
 * Props del componente TableHeader
 */
export interface TableHeaderProps {
  /**
   * Nombre del ícono a mostrar
   */
  iconName: IconName;

  /**
   * Texto del encabezado
   */
  label: string;

  /**
   * Clase CSS adicional para el contenedor
   */
  className?: string;
}
