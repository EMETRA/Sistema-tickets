import { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Variante del botón.
 */
export type ButtonVariant = "contained" | "outlined" | "text";

/**
 * Color del botón.
 */
export type ButtonColor = "success" | "danger" | "cancel" | "default";

/**
 * Estado del botón.
 */
export type ButtonState = "default" | "disabled" | "loading";

/**
 * Propiedades del componente Button.
 *
 * Extiende las propiedades nativas de HTMLButtonElement.
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  /**
   * Variante visual del botón.
   * - contained: botón con relleno
   * - outlined: botón con borde
   * - text: solo texto
   * @default "contained"
   */
  variant?: ButtonVariant;

  /**
   * Color del botón.
   * @default "default"
   */
  color?: ButtonColor;

  /**
   * Si el botón tiene bordes redondeados completos (border-radius: 50px).
   * Solo aplica para variantes "contained" y "outlined".
   * @default false
   */
  rounded?: boolean;

  /**
   * Si el botón ocupa todo el ancho disponible.
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Estado del botón.
   * @default "default"
   */
  state?: ButtonState;

  /**
   * Contenido del botón.
   */
  children: ReactNode;

  /**
   * Clase CSS adicional.
   */
  className?: string;

  /**
   * Texto que se muestra cuando el botón está en estado loading.
   * @default "Cargando..."
   */
  loadingText?: string;
}
