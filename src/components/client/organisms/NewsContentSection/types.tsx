import type { NewsFormSection, NewsSectionField } from "../NewsForm/types";

/**
 * Props del componente NewsContentSection
 */
export interface NewsContentSectionProps {
    /**
     * Posición de la sección (0-based); se muestra como "Sección N"
     */
    index: number;

    section: NewsFormSection;

    /**
     * Errores de la sección
     */
    errors?: Partial<Record<NewsSectionField, string>>;

    /**
     * Tipos aceptados para la imagen de la sección (atributo accept)
     */
    accept: string;

    canMoveUp: boolean;
    canMoveDown: boolean;
    canRemove: boolean;

    onChange: (field: NewsSectionField, value: string) => void;
    onImageChange: (file: File | null) => void;
    /**
     * Agrega un video de YouTube como recurso de la sección (reemplaza la imagen).
     * Opcional: sin él, la sección solo acepta imagen.
     */
    onVideoAdd?: (url: string, youtubeId: string) => void;
    /**
     * Límite total de imágenes de la noticia: `usedBytes` ya usados por las otras imágenes
     * (sin contar la de esta sección) y `maxBytes`. Opcional: sin él no hay límite.
     */
    imageLimit?: { usedBytes: number; maxBytes: number };
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;

    className?: string;
}
