export interface ProgressRingProps {
    /** Porcentaje de 0 a 100 */
    percentage: number;
    /** Tamaño en píxeles (ancho y alto) */
    size?: number;
    /** Grosor de la línea del anillo */
    strokeWidth?: number;
    fontSize?: string;
    /** Clase opcional para estilos externos */
    className?: string;
}