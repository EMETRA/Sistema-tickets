import type { NewsFormValues } from "../NewsForm/types";

/**
 * Props del componente NewsPreview
 */
export interface NewsPreviewProps {
    /**
     * Valores actuales del formulario
     */
    values: NewsFormValues;

    /**
     * Nombres ya resueltos de categoría y subcategoría (vacío si no aplica)
     */
    categoryLabels: string[];

    /**
     * Nombres ya resueltos de las etiquetas
     */
    tagLabels: string[];

    /**
     * Deshabilita las acciones mientras se procesa algo
     * @default false
     */
    disabled?: boolean;

    onBack: () => void;
    onPublish: () => void;

    className?: string;
}
