
/**
 * Estados.
 */
export type FileItemStatus = 
    | "ready"
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
     * Texto secundario (p. ej. "8.4 MB · Cargado").
     * Si se envía, reemplaza el texto "Cargado" del estado done.
     */
    description?: string;

    /**
     * Accion al eliminar.
     */
    onRemove?: () => void;

    /**
     * Clase CSS adicional.
     */
    className?: string;

}