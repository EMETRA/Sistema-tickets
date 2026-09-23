import type { SelectOption } from "../../atoms/Select/types";
import type { LabelOption } from "../../molecules/LabelChipGroup/types";

/**
 * Archivo del formulario de noticias.
 * - `file` con valor: archivo nuevo seleccionado por el usuario (pendiente de subir)
 * - `file` null: recurso ya guardado en backend (modo edición)
 */
export interface NewsFormFile {
    id: string;
    name: string;
    /** null = desconocido (los recursos guardados no incluyen tamaño) */
    sizeBytes: number | null;
    mimeType: string;
    file: File | null;
    url?: string;
}

/**
 * Sección de contenido de la noticia.
 */
export interface NewsFormSection {
    id: string;
    encabezado: string;
    contenido: string;
    imagen: NewsFormFile | null;
}

/**
 * Valores del formulario. Los nombres de campo siguen el input GraphQL (en español).
 */
export interface NewsFormValues {
    titulo: string;
    resumen: string;
    /** Texto libre */
    autor: string;
    /** Id de categoría raíz (TB_CATEGORIA) */
    categoriaId: string;
    /** Id de categoría hija; vacío = sin subcategoría */
    subcategoriaId: string;
    /** Ids del catálogo TB_ETIQUETA */
    etiquetaIds: string[];
    idioma: string;
    visibilidad: string;
    /** YYYY-MM-DD */
    fechaPublicacion: string;
    slug: string;
    /** Texto del input; vacío = sin tiempo de lectura */
    tiempoLectura: string;
    archivoPrincipal: NewsFormFile | null;
    secciones: NewsFormSection[];
    galeria: NewsFormFile[];
}

/**
 * Campos de texto/select editables con onFieldChange.
 */
export type NewsFormTextField =
    | "resumen"
    | "autor"
    | "categoriaId"
    | "subcategoriaId"
    | "idioma"
    | "visibilidad"
    | "fechaPublicacion"
    | "tiempoLectura";

/**
 * Errores por ruta del campo, p. ej. "titulo" o "secciones.1.contenido".
 */
export type NewsFormErrors = Record<string, string>;

export type NewsSectionField = "encabezado" | "contenido";

/**
 * Opciones de los selects del formulario.
 */
export interface NewsFormOptions {
    categorias: SelectOption[];
    /** Hijas de la categoría seleccionada */
    subcategorias: SelectOption[];
    idiomas: SelectOption[];
    visibilidades: SelectOption[];
    /** Catálogo de etiquetas */
    etiquetas: LabelOption[];
}

/**
 * Tipos de archivo aceptados por cada zona de carga (atributo accept).
 */
export interface NewsFormAccept {
    principal: string;
    seccion: string;
    galeria: string;
    /** Texto de ayuda con los formatos y el tamaño permitidos */
    formatsLabel: string;
}

/**
 * Props del componente NewsForm
 */
export interface NewsFormProps {
    /**
     * Título de la pantalla ("Crear noticia" / "Editar noticia")
     */
    heading: string;

    values: NewsFormValues;
    errors: NewsFormErrors;
    options: NewsFormOptions;
    accept: NewsFormAccept;

    /**
     * Deshabilita las acciones mientras se procesa algo
     * @default false
     */
    disabled?: boolean;

    onTitleChange: (value: string) => void;
    onSlugChange: (value: string) => void;
    onFieldChange: (field: NewsFormTextField, value: string) => void;

    onTagsChange: (etiquetaIds: string[]) => void;

    onMainFileChange: (file: File | null) => void;

    onAddSection: () => void;
    onSectionChange: (sectionId: string, field: NewsSectionField, value: string) => void;
    onSectionImageChange: (sectionId: string, file: File | null) => void;
    onMoveSection: (sectionId: string, direction: "up" | "down") => void;
    onRemoveSection: (sectionId: string) => void;

    onAddGalleryFiles: (files: File[]) => void;
    onRemoveGalleryFile: (fileId: string) => void;

    onCancel: () => void;
    onSaveDraft: () => void;
    onPreview: () => void;
    onPublish: () => void;

    className?: string;
}
