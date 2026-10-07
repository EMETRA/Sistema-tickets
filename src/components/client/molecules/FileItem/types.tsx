
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
     * Reemplaza el ícono que se elige por la extensión del nombre (p. ej. la miniatura de un
     * video de YouTube, que no tiene extensión). Opcional; sin él, el comportamiento no cambia.
     */
    thumbnail?: React.ReactNode;

    /**
     * Clase CSS adicional.
     */
    className?: string;

}