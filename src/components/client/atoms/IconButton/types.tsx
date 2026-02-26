import { IconName } from "../Icon/types";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Nombre del icono a mostrar
   */
  icon: IconName;
  
  /**
   * Tamaño del icono en píxeles
   * @default 24
   */
  size?: number;
  
  /**
   * Estado deshabilitado del botón
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Estado de carga del botón
   * Cuando está en true, muestra un spinner y no permite clics
   * @default false
   */
  loading?: boolean;
  
  /**
   * Función a ejecutar al hacer clic
   */
  onClick?: () => void;

  /**
   * Sin bordes
   * @default false
   */
  borderless?: boolean;
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}
