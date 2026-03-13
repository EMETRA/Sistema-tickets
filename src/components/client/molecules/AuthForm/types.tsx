import { ReactNode, SubmitEventHandler } from "react";

/**
 * Propiedades del componente AuthForm.
 */
export interface AuthFormProps {

    /**
     * Titulo de formulario.
     */
    title: string;

    /**
     * Contenido del authform
     */
    children: ReactNode;

    /**
     * Función para enviar petición.
     */
    onSubmit?: SubmitEventHandler<HTMLFormElement>;

    /**
     * Clase CSS adicional.
     */
    className?: string;

};