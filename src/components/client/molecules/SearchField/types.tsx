
/**
 * Propiedades del componente SearchField.
 */
export interface SearchFieldProps {

    /**
     * Valor del input.
     */
    value: string;
    
    /**
     * Texto a mostrar para la búsqueda.
     */
    placeholder?: string;

    /**
     * Función al cambiar.
     */
    onChange: (value: string) => void;

    /**
     * Función al buscar.
     */
    onSearch: () => void;

    /**
     * Clase CSS adicional.
     */
    className?: string;
}