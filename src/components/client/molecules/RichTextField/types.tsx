
/**
 * Propiedades del componente RichTextField.
 */
export interface RichTextFieldProps {
    
    /**
     * Valor del input.
     */
    value: string;

    /**
     * Función al cambiar.
     */
    onChange: (value: string) => void;

    /**
     * Clase CSS adicional.
     */
    className?: string;

}