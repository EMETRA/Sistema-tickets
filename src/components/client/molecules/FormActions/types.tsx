import { ReactNode } from "react";

/**
 * Alineacion.
 */
export type FormActionsAlign = "left" | "right" | "center" | "space-between";

/**
 * Propiedades del componente FormActions.
 */
export interface FormActionsProps {

    /**
     * Contenido del formfield.
     */
    children: ReactNode;

    /**
     * Alineación
     * @default right
     */
    align?: FormActionsAlign;

    /**
     * Clase CSS adicional.
     */
    className?: string;

};