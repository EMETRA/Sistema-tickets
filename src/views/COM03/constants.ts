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
 * Formatos permitidos (confirmado por backend): imágenes JPG, PNG o GIF y video MP4.
 * Se listan MIME y extensión porque algunos sistemas no informan el MIME al arrastrar archivos.
 */
const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif";
const VIDEO_ACCEPT = "video/mp4,.mp4";

/**
 * TODO [COM03-BACKEND]: tamaño máximo por archivo pendiente de definir (hoy sin límite).
 * Las secciones solo aceptan imagen ("Imagen de esta sección").
 */
export const NEWS_FORM_ACCEPT: NewsFormAccept = {
    principal: `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`,
    seccion: IMAGE_ACCEPT,
    galeria: `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`,
    formatsLabel: "Formatos: JPG, PNG, GIF o MP4. Tamaño máximo: [por definir]",
};
