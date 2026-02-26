export type PopOverPosition = 
    | "center" 
    | "top" | "bottom" | "left" | "right"
    | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface PopOverProps {
    /** Estado de visibilidad controlado desde el padre */
    isOpen: boolean;
    /** Función para cerrar el PopOver */
    onClose: () => void;
    /** El esqueleto que soporta cualquier átomo o molécula */
    children: React.ReactNode;
    /** Posición exacta en la pantalla */
    position?: PopOverPosition;
    /** Fondo oscuro detrás de la ventana */
    withOverlay?: boolean;
    className?: string;
}