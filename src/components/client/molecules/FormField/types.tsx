import { ReactNode } from "react";

/**
 * Propiedades del componente FormField.
 */
export interface FormFieldProps {

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
     * Contenido del formfield.
     */
    children: ReactNode;

    /**
     * Clase CSS adicional.
     */
    className?: string;

};