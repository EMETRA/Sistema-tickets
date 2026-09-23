
export type FileDropzoneVariant = "default" | "compact";

/**
 * Propiedades del componente FileDropzone.
 */
export interface FileDropzoneProps {
    onFiles: (files: File[]) => void;
    rejectedFiles?: string[];
    className?: string;

    /**
     * Variante visual.
     * - default: ícono grande (creación de tickets)
     * - compact: sin ícono, con botón de selección
     * @default "default"
     */
    variant?: FileDropzoneVariant;

    /**
     * Texto principal
     * @default "Arrastra tu archivo o da click aquí"
     */
    title?: string;

    /**
     * Texto secundario
     * @default "900MB tamaño máximo del archivo"
     */
    subtitle?: string;

    /**
     * Texto del botón (solo variante compact)
     * @default "Seleccionar archivo"
     */
    buttonLabel?: string;

    /**
     * Permite seleccionar varios archivos
     * @default true
     */
    multiple?: boolean;

    /**
     * Tipos aceptados por el selector de archivos (atributo accept)
     */
    accept?: string;

    /**
     * Muestra el borde en estado de error
     * @default false
     */
    hasError?: boolean;
}
