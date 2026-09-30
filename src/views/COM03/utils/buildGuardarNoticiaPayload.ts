import {
    AccionNoticia,
    type EstadoNoticiaCms,
    type GaleriaItemCmsInput,
    type GuardarNoticiaCmsVariables,
    type NoticiaCmsInput,
    type VisibilidadNoticiaCms,
} from "@/api/graphql/COM03";
import type { NewsFormFile, NewsFormValues } from "@/components/client/organisms/NewsForm";
import { ddMmYyyyToApiDateTime } from "@/helpers/dateInput";
import { textToHtml } from "@/helpers/textHtml";

/** Qué `estado` se pide según el botón (tabla "Qué hace cada botón del editor" del README). */
export const ESTADO_POR_ACCION: Record<AccionNoticia, EstadoNoticiaCms> = {
    [AccionNoticia.BORRADOR]: "borrador",
    [AccionNoticia.PROGRAMAR]: "programada",
    [AccionNoticia.PUBLICAR]: "publicada",
};

/**
 * Archivo nuevo del formulario que todavía no se puede enviar: la API recibe ids de recurso
 * (`recurso_principal_id`, `recurso_id`) y aún no está definido cómo se suben las imágenes.
 */
export interface ArchivoPendiente {
    /** Dónde va: "recurso_principal", "secciones.0" o "galeria.1" */
    destino: string;
    file: File;
}

export interface GuardarNoticiaPayload {
    variables: GuardarNoticiaCmsVariables;
    /**
     * TODO [COM03-BACKEND]: archivos nuevos sin subir. Feyser y backend definen cómo se suben
     * para obtener su `recurso_id`; hasta entonces no se envían.
     */
    archivosPendientes: ArchivoPendiente[];
}

/** Id numérico de la API. Los ids que no son números (p. ej. del dummy) no se envían. */
const toApiId = (id: string): number | null => (/^\d+$/.test(id) ? Number(id) : null);

/**
 * Convierte los valores del formulario en las variables de `guardarNoticiaCms` (README):
 * - `estado` según el botón; la fecha dd/mm/aaaa → ISO (00:00 hora de Guatemala).
 * - Categoría y subcategoría van juntas en `categoriasIds`.
 * - Imagen ya guardada → su `recurso_id`. Imagen nueva → queda en `archivosPendientes` y el campo
 *   no se envía (así backend conserva el recurso que tenía).
 * - Video de YouTube → `video_url` (recurso principal, sección y galería).
 * - El contenido de las secciones va como HTML (contenido_html).
 * TODO [COM03-BACKEND]: `video_url` y `galeria` siguen la propuesta enviada a backend
 * (2026-09-30), pendiente de confirmar. `autor` no se envía (no está en el input).
 */
export function buildGuardarNoticiaPayload(
    values: NewsFormValues,
    noticiaId: string | null,
    accion: AccionNoticia,
    claveIdempotente: string,
): GuardarNoticiaPayload {
    const archivosPendientes: ArchivoPendiente[] = [];

    /**
     * Imagen → recurso_id. undefined = no enviar el campo; null = quitar el recurso;
     * número = recurso existente. (Los videos se envían aparte, como video_url.)
     */
    const toRecursoId = (file: NewsFormFile | null, destino: string): number | null | undefined => {
        if (!file) return null;
        if (file.file) {
            archivosPendientes.push({ destino, file: file.file });
            return undefined;
        }
        return toApiId(file.id) ?? undefined;
    };

    /** URL del video de YouTube, si el recurso es un video. */
    const videoUrl = (file: NewsFormFile | null) => (file?.youtubeId && file.url ? file.url : null);

    const tiempoLectura = values.tiempoLectura.trim();

    const noticia: NoticiaCmsInput = {
        slug: values.slug.trim(),
        titulo: values.titulo.trim(),
        resumen: values.resumen.trim(),
        estado: ESTADO_POR_ACCION[accion],
        visibilidad: values.visibilidad as VisibilidadNoticiaCms,
        fecha_publicacion: ddMmYyyyToApiDateTime(values.fechaPublicacion),
        idioma: values.idioma,
        tiempo_lectura: tiempoLectura ? Number(tiempoLectura) : null,
        categoriasIds: [values.categoriaId, values.subcategoriaId]
            .map(toApiId)
            .filter((id): id is number => id !== null),
        etiquetasIds: values.etiquetaIds
            .map(toApiId)
            .filter((id): id is number => id !== null),
        secciones: values.secciones.map((section, index) => {
            const base = {
                orden: index + 1,
                encabezado: section.encabezado.trim(),
                contenido_html: textToHtml(section.contenido),
            };
            const video = videoUrl(section.imagen);
            if (video) return { ...base, video_url: video };
            const recursoId = toRecursoId(section.imagen, `secciones.${index}`);
            return recursoId !== undefined ? { ...base, recurso_id: recursoId } : base;
        }),
    };

    // Recurso principal: video (recurso_principal.video_url) o imagen (recurso_principal_id).
    const videoPrincipal = videoUrl(values.archivoPrincipal);
    if (videoPrincipal) {
        noticia.recurso_principal = { video_url: videoPrincipal };
    } else {
        const recursoPrincipalId = toRecursoId(values.archivoPrincipal, "recurso_principal");
        if (recursoPrincipalId !== undefined) noticia.recurso_principal_id = recursoPrincipalId;
    }

    const id = noticiaId ? toApiId(noticiaId) : null;
    if (id !== null) noticia.id = id;

    // Galería mixta, en el orden del formulario: imagen guardada → recurso_id; video → video_url;
    // imagen nueva → pendiente de subir (no se envía todavía).
    const galeria: GaleriaItemCmsInput[] = [];
    values.galeria.forEach((file, index) => {
        const video = videoUrl(file);
        if (video) {
            galeria.push({ orden: galeria.length + 1, video_url: video });
            return;
        }
        const recursoId = toRecursoId(file, `galeria.${index}`);
        if (typeof recursoId === "number") galeria.push({ orden: galeria.length + 1, recurso_id: recursoId });
    });
    noticia.galeria = galeria;

    return { variables: { claveIdempotente, noticia }, archivosPendientes };
}
