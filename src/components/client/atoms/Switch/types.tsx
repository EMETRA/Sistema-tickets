import { InputHTMLAttributes } from "react";

/**
 * Estado posible del switch.
 */
export type SwitchState = "default" | "error" | "disabled";

/**
 * Tamaño del switch.
 */
export type SwitchSize = "small" | "medium" | "large";

/**
 * Propiedades del componente Switch.
 *
 * Extiende las propiedades nativas de HTMLInputElement con el tipo "checkbox".
 */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /**
   * Estado visual del switch.
   * @default "default"
   */
  state?: SwitchState;

  /**
   * Mensaje de error a mostrar cuando el state es "error".
   */
  errorMessage?: string;

  /**
   * Texto del label opcional para el switch.
   */
  label?: string;

  /**
   * Clase CSS adicional para el contenedor.
   */
  className?: string;

  /**
   * Tamaño del switch.
   * @default "medium"
   */
  switchSize?: SwitchSize;
}
