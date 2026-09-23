import type { NoticiaListItem } from "@/api/graphql/COM03";

/**
 * Filtro de tabs del listado de noticias.
 */
export type NewsFilter = "all" | "PUBLICADA" | "BORRADOR" | "PROGRAMADA" | "ARCHIVADA";

/**
 * Props del componente NewsTablePanel
 */
export interface NewsTablePanelProps {
    /**
     * Noticias ya filtradas a mostrar en la tabla
     */
    noticias: NoticiaListItem[];

    /**
     * Si es true muestra las filas skeleton
     * @default false
     */
    loading?: boolean;

    /**
     * Si es true muestra el estado "Aún no hay noticias"
     * (no hay ninguna noticia creada, sin importar el filtro)
     * @default false
     */
    isEmpty?: boolean;

    /**
     * Tab seleccionado
     */
    filter: NewsFilter;

    /**
     * Callback al cambiar de tab
     */
    onFilterChange: (value: NewsFilter) => void;

    /**
     * Texto del buscador por título
     */
    search: string;

    /**
     * Callback al escribir en el buscador
     */
    onSearchChange: (value: string) => void;

    /**
     * Acciones
     */
    onCreate?: () => void;
    onEdit?: (id: string) => void;
    onArchive?: (id: string) => void;
    onDelete?: (id: string) => void;
    onRestore?: (id: string) => void;

    /**
     * Clase CSS adicional
     */
    className?: string;
}
