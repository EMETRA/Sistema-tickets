export interface AlertBarProps {
  /**
   * La duración de la carga en SEGUNDOS (ej. 3, 0.5, 10).
   * Es requerida para que la animación funcione.
   */
  duration: number;

  /**
   * Código de color hexadecimal o variable CSS (ej. '#FF9800', 'var(--color-error)').
   * Si no se pasa, usará el color por defecto del SCSS.
   */
  color?: string;

  /** Clase adicional para el contenedor externo */
  className?: string;
}