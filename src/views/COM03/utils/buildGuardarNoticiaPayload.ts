import {
    AccionNoticia,
    type EstadoNoticiaCms,
    type GuardarNoticiaCmsInput,
    type GuardarNoticiaCmsVariables,
    type SeccionNoticiaCmsInput,
    type VisibilidadNoticiaCms,
} from "@/api/graphql/COM03";
import type { NewsFormFile, NewsFormValues } from "@/components/client/organisms/NewsForm";
import { ddMmYyyyToApiDateTime } from "@/helpers/dateInput";
import { textToHtml } from "@/helpers/textHtml";

/** Qué `estado` se pide según el botón (README, "Qué hace cada botón del editor"). */
export const ESTADO_POR_ACCION: Record<AccionNoticia, EstadoNoticiaCms> = {
    [AccionNoticia.BORRADOR]: "borrador",
    [AccionNoticia.PROGRAMAR]: "programada",
    [AccionNoticia.PUBLICAR]: "publicada",
};

/**
 * Recurso nuevo del formulario que todavía no se puede enviar: la API recibe ids de recurso y falta
 * cómo obtenerlos desde api-tickets (subir imágenes y registrar videos; pendiente con backend).
 * - imagen nueva;
 * - video de YouTube agregado en el formulario.
 */
export interface RecursoPendiente {
    /** Dónde va: "recurso_principal", "secciones.0" o "galeria.1" */
    destino: string;
    tipo: "imagen" | "video";
    /** Imagen nueva */
    file?: File;
    /** Video de YouTube (https://www.youtube.com/watch?v=ID) */
    url?: string;
}

export interface GuardarNoticiaPayload {
    variables: GuardarNoticiaCmsVariables;
    /**
     * TODO [COM03-BACKEND]: recursos nuevos que no se envían hasta que api-tickets permita subirlos.
     * Sirven para avisar en el formulario y para subirlos cuando exista la operación.
     */
    pendientes: RecursoPendiente[];
}

/** Id numérico de la API. Los ids que no son números (p. ej. locales o del dummy) no se envían. */
const toApiId = (id: string): number | null => (/^\d+$/.test(id) ? Number(id) : null);

/**
 * Convierte los valores del formulario en las variables de `guardarNoticiaCms`
 * (README "Noticias CMS", 2026-10-06): `{ input: GuardarNoticiaCmsInput }`, en camelCase.
 * - `estado` según el botón; `visibilidad` e `idioma` siempre (son obligatorios).
 * - `slug` y `titulo` se envían siempre (son String! en el contrato).
 * - Fecha dd/mm/aaaa → ISO, 00:00 hora de Guatemala.
 * - Categoría y subcategoría van juntas en `categoriasIds`.
 * - Recurso ya guardado (imagen o video, id numérico de la API) → su id (`recursoPrincipalId`,
 *   `recursoId`, `galeriaRecursosIds`). Un video de YouTube es un recurso más (README "Noticias
 *   CMS", sección 4). Imagen o video nuevo → va a `pendientes` y su campo no se envía (en el
 *   recurso principal, backend conserva el que tenía).
 * - Las secciones van completas (reemplazan las anteriores), con `contenidoHtml`.
 * - La galería va como `galeriaRecursosIds`, en el orden de la pantalla. Es reemplazo total
 *   (README, sección 3: `[]` borra), así que se omite si algún recurso guardado no tiene id
 *   numérico (p. ej. datos de ejemplo): mejor conservar la galería que borrarla por error.
 * TODO [COM03-BACKEND]: `autores` no se envía: falta cómo obtener el catálogo de autores.
 */
export function buildGuardarNoticiaPayload(
    values: NewsFormValues,
    noticiaId: string | null,
    accion: AccionNoticia,
    claveIdempotente: string,
): GuardarNoticiaPayload {
    const pendientes: RecursoPendiente[] = [];

    /**
     * Id del recurso para enviar. undefined = no enviar el campo (pendiente o id no numérico);
     * null = sin recurso; número = recurso ya guardado.
     */
    const toRecursoId = (file: NewsFormFile | null, destino: string): number | null | undefined => {
        if (!file) return null;
        if (file.file) {
            pendientes.push({ destino, tipo: "imagen", file: file.file });
            return undefined;
        }
        const apiId = toApiId(file.id);
        // Video de YouTube agregado en el formulario: aún no está registrado como recurso.
        if (file.youtubeId && file.url && apiId === null) {
            pendientes.push({ destino, tipo: "video", url: file.url });
            return undefined;
        }
        return apiId ?? undefined;
    };

    const tiempoLectura = values.tiempoLectura.trim();

    const input: GuardarNoticiaCmsInput = {
        claveIdempotente,
        slug: values.slug.trim(),
        titulo: values.titulo.trim(),
        resumen: values.resumen.trim(),
        estado: ESTADO_POR_ACCION[accion],
        visibilidad: values.visibilidad as VisibilidadNoticiaCms,
        fechaPublicacion: ddMmYyyyToApiDateTime(values.fechaPublicacion),
        idioma: values.idioma,
        tiempoLectura: tiempoLectura ? Number(tiempoLectura) : null,
        categoriasIds: [values.categoriaId, values.subcategoriaId]
            .map(toApiId)
            .filter((id): id is number => id !== null),
        etiquetasIds: values.etiquetaIds
            .map(toApiId)
            .filter((id): id is number => id !== null),
        secciones: values.secciones.map((section, index): SeccionNoticiaCmsInput => {
            const recursoId = toRecursoId(section.imagen, `secciones.${index}`);
            return {
                orden: index + 1,
                encabezado: section.encabezado.trim(),
                contenidoHtml: textToHtml(section.contenido),
                ...(recursoId !== undefined ? { recursoId } : {}),
            };
        }),
    };

    const recursoPrincipalId = toRecursoId(values.archivoPrincipal, "recurso_principal");
    if (recursoPrincipalId !== undefined) input.recursoPrincipalId = recursoPrincipalId;

    const id = noticiaId ? toApiId(noticiaId) : null;
    if (id !== null) input.id = id;

    // Galería: ids guardados en orden; los nuevos quedan pendientes. Si un guardado no tiene id
    // numérico (undefined), no se envía el campo para no borrar la galería.
    const galeriaRecursosIds: number[] = [];
    let sinIdConocido = false;
    values.galeria.forEach((file, index) => {
        const pendientesAntes = pendientes.length;
        const recursoId = toRecursoId(file, `galeria.${index}`);
        if (typeof recursoId === "number") galeriaRecursosIds.push(recursoId);
        else if (pendientes.length === pendientesAntes) sinIdConocido = true;
    });
    if (!sinIdConocido) input.galeriaRecursosIds = galeriaRecursosIds;

    return { variables: { input }, pendientes };
}
