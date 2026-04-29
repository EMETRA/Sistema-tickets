
/**
 * Propiedades del componente FileDropzone.
 */
export interface FileDropzoneProps {
    onFiles: (files: File[]) => void;
    rejectedFiles?: string[]; 
    className?: string;
}