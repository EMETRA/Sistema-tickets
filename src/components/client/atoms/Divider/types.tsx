/**
 * Propiedades para el átomo Divider.
 */
export interface DividerProps {
    /**
     * Define si la línea es horizontal (por defecto) o vertical.
     * Útil para separar secciones en el Login o filas en el Dashboard.
     */
    orientation?: "horizontal" | "vertical";

    /**
     * Clases de CSS adicionales para personalizar el espaciado o color.
     */
    className?: string;

    /**
     * Si se activa, evita que el divisor se encoja dentro de contenedores Flex.
     */
    flexItem?: boolean;
}