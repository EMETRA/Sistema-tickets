import type { AccionNoticia, GuardarNoticiaInput, RecursoNoticiaInput } from "@/api/graphql/COM03";
import type { NewsFormFile, NewsFormValues } from "@/components/client/organisms/NewsForm";
import { textToHtml } from "@/helpers/textHtml";
import { isLocalId } from "../hooks/useNewsForm";

export interface GuardarNoticiaPayload {
    input: GuardarNoticiaInput;
    /** Archivos nuevos, en el orden de las claves de fileMap ("0", "1", ...) */
    files: File[];
    /** Multipart: índice del archivo → ruta de la variable donde va */
    fileMap: Record<string, string[]>;
}

/**
 * Convierte los valores del formulario en el input de `guardarNoticia`.
 * - Recurso existente → { recursoId, archivo: null }
 * - Archivo nuevo → { recursoId: null, archivo: null } + entrada en files/fileMap
 * - El contenido de las secciones se envía como HTML (TB_SECCION_NOTICIA.contenido_html)
 */
export function buildGuardarNoticiaPayload(
    values: NewsFormValues,
    noticiaId: string | null,
    accion: AccionNoticia,
    claveIdempotencia: string,
): GuardarNoticiaPayload {
    const files: File[] = [];
    const fileMap: Record<string, string[]> = {};

    const toRecurso = (file: NewsFormFile | null, path: string): RecursoNoticiaInput | null => {
        if (!file) return null;
        if (file.file) {
            fileMap[String(files.length)] = [`variables.input.${path}.archivo`];
            files.push(file.file);
            return { recursoId: null, archivo: null };
        }
        return { recursoId: file.id, archivo: null };
    };

    const input: GuardarNoticiaInput = {
        id: noticiaId,
        claveIdempotencia,
        accion,
        titulo: values.titulo.trim(),
        resumen: values.resumen.trim(),
        autor: values.autor.trim(),
        categoriaId: values.categoriaId || null,
        subcategoriaId: values.subcategoriaId || null,
        etiquetaIds: values.etiquetaIds,
        idioma: values.idioma,
        visibilidad: values.visibilidad,
        fechaPublicacion: values.fechaPublicacion || null,
        slug: values.slug.trim(),
        tiempoLectura: values.tiempoLectura.trim() ? Number(values.tiempoLectura) : null,
        recursoPrincipal: toRecurso(values.archivoPrincipal, "recursoPrincipal"),
        secciones: values.secciones.map((section, index) => ({
            id: isLocalId(section.id) ? null : section.id,
            orden: index + 1,
            encabezado: section.encabezado.trim(),
            contenidoHtml: textToHtml(section.contenido),
            recurso: toRecurso(section.imagen, `secciones.${index}.recurso`),
        })),
        galeria: values.galeria
            .map((file, index) => toRecurso(file, `galeria.${index}`))
            .filter((recurso): recurso is RecursoNoticiaInput => recurso !== null),
    };

    return { input, files, fileMap };
}
