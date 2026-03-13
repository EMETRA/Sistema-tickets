
/**
 * Estados.
 */
export type FileItemStatus = 
    | "uploading"
    | "done";

/**
 * Propiedades del componente FileItem.
 */
export interface FileItemProps {

    /**
     * Nombre del archivo.
     */
    name: string;

    /**
     * Estado del archivo.
     */
    status: FileItemStatus;

    /**
     * Estado del archivo.
     */
    progress?: number;

    /**
     * Accion al eliminar.
     */
    onRemove?: () => void;

    /**
     * Clase CSS adicional.
     */
    className?: string;

}