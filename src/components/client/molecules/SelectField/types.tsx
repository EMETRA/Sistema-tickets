import { ReactNode } from "react";

/**
 * Propiedades del componente SelectField.
 */
export interface SelectFieldProps {

    /**
     * Etiqueta del campo.
     */
    label: string;

    /**
     * Para asociar al id del campo.
     */
    htmlFor: string;

    /**
     * Si es requerido se pondrá un * rojo para indicar campo obligatorio.
     * @default false
     */
    required?: boolean;

    /**
     * Contenido del authform
     */
    children: ReactNode;

    /**
     * Clase CSS adicional.
     */
    className?: string;
}