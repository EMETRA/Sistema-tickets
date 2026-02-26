import { SelectHTMLAttributes } from "react";

/**
 * Estado posible del select.
 */
export type SelectState = "default" | "error" | "disabled";

/**
 * Opción individual del select.
 */
export interface SelectOption {
  /**
   * Valor de la opción.
   */
  value: string | number;

  /**
   * Etiqueta visible de la opción.
   */
  label: string;

  /**
   * Si la opción está deshabilitada.
   */
  disabled?: boolean;
}

/**
 * Grupo de opciones del select.
 */
export interface SelectOptionGroup {
  /**
   * Label del grupo.
   */
  label: string;

  /**
   * Opciones dentro del grupo.
   */
  options: SelectOption[];
}

/**
 * Propiedades del componente Select.
 *
 * Extiende las propiedades nativas de HTMLSelectElement.
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  /**
   * Estado visual del select.
   * @default "default"
   */
  state?: SelectState;

  /**
   * Mensaje de error a mostrar cuando el state es "error".
   */
  errorMessage?: string;

  /**
   * Clase CSS adicional para el contenedor.
   */
  className?: string;

  /**
   * Texto placeholder cuando no hay opción seleccionada.
   */
  placeholder?: string;

  /**
   * Opciones del select (puede ser un array simple o con grupos).
   */
  options: SelectOption[] | SelectOptionGroup[];
}
