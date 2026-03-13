
/**
 * Acciones.
 */
export type RichTextActions = 
    | "bold"
    | "italic"
    | "underline"
    | "strike"
    | "bullet";

/**
 * Propiedades del componente RichTextToolbar.
 */
export interface RichTextToolbarProps {

    /**
     * Función para enviar accion.
     */
    onAction: (action: RichTextActions) => void;

    /**
     * Clase CSS adicional.
     */
    className?: string;

}