import { VisibilidadNoticia } from "@/api/graphql/COM03";
import type { SelectOption } from "@/components/client/atoms/Select/types";
import type { NewsFormAccept } from "@/components/client/organisms/NewsForm";

/**
 * Visibilidad según TB_NOTICIA.VISIBILIDAD.
 */
export const VISIBILIDAD_OPTIONS: SelectOption[] = [
    { value: VisibilidadNoticia.PUBLICA, label: "Pública" },
    { value: VisibilidadNoticia.PRIVADA, label: "Privada" },
];

/**
 * TODO [COM03-BACKEND]: el modelo solo indica el valor por defecto (es-GT).
 * Confirmar si hay otros idiomas o si el campo es fijo.
 */
export const IDIOMA_OPTIONS: SelectOption[] = [
    { value: "es-GT", label: "Español" },
];

/** Opción vacía de Subcategoría (la categoría no tiene hijas o no se elige ninguna) */
export const SIN_SUBCATEGORIA_OPTION: SelectOption = { value: "", label: "— Sin subcategoría —" };

/** Colores de los chips de etiquetas */
export const TAG_CHIP_COLORS = {
    color: "#1700A5",
    backgroundColor: "#92B9FF40",
};

/**
 * Valores por defecto del formulario en modo creación.
 * TODO [COM03-BACKEND]: confirmar el autor sugerido por defecto.
 */
export const NEWS_FORM_DEFAULTS = {
    autor: "Comunicación EMETRA",
    idioma: "es-GT",
    visibilidad: VisibilidadNoticia.PUBLICA,
};

/**
 * Formatos de archivo permitidos: imágenes JPG, PNG o GIF.
 * Ya no se suben videos MP4 (decisión 2026-09-30, indicada por Feyser): los videos son enlaces de
 * YouTube en el recurso principal, las secciones y la galería (YouTubeLinkField).
 * Se listan MIME y extensión porque algunos sistemas no informan el MIME al arrastrar archivos.
 */
const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif";

/**
 * Límite de 20 MB entre todas las imágenes de la noticia (principal, secciones y galería),
 * decisión del usuario 2026-09-30. Los videos de YouTube no cuentan (son enlaces).
 * TODO [COM03-BACKEND]: las imágenes ya guardadas no traen tamaño, así que al editar solo se
 * cuentan las nuevas; backend también debe validar el límite.
 */
export const NEWS_MAX_IMAGES_BYTES = 20 * 1024 * 1024;

export const NEWS_FORM_ACCEPT: NewsFormAccept = {
    principal: IMAGE_ACCEPT,
    seccion: IMAGE_ACCEPT,
    galeria: IMAGE_ACCEPT,
    formatsLabel: "Formatos: JPG, PNG o GIF. Máximo 20 MB entre todas las imágenes de la noticia.",
    maxTotalBytes: NEWS_MAX_IMAGES_BYTES,
};
