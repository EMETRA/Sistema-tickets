/**
 * Propiedades del átomo PlayBadge.
 */
export interface PlayBadgeProps {
    /**
     * - sm: miniatura en listas (50 × 50, como el ícono de FileItem)
     * - md: círculo de reproducir sobre un video (recuadro oscuro)
     * @default "md"
     */
    size?: "sm" | "md";

    className?: string;
}
