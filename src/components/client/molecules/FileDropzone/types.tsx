
/**
 * Propiedades del componente FileDropzone.
 */
export interface FileDropzoneProps {

    onFiles: (files: File[]) => void;

    /**
     * Clase CSS adicional.
     */
    className?: string;

}