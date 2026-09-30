"use client";

import { useCallback, useMemo, useState } from "react";
import { TipoRecurso, type NoticiaDetalle, type RecursoNoticia } from "@/api/graphql/COM03";
import type {
    NewsFormErrors,
    NewsFormFile,
    NewsFormSection,
    NewsFormTextField,
    NewsFormValues,
    NewsSectionField,
} from "@/components/client/organisms/NewsForm";
import { apiDateToDdMmYyyy, ddMmYyyyToIsoDate, todayIsoDateGuatemala } from "@/helpers/dateInput";
import { slugify } from "@/helpers/slugify";
import { parseYouTubeId, toYouTubeWatchUrl } from "@/helpers/youtube";
import { htmlToText } from "@/helpers/textHtml";
import { NEWS_FORM_DEFAULTS } from "../constants";
import { validateNewsForm, type NewsValidationMode } from "../schemas/newsForm.schema";

/**
 * Qué hace el botón Publicar según la fecha (dd/mm/aaaa): fecha futura = programar.
 */
export type PublishIntent = "publicar" | "programar";

let localIdSequence = 0;
const LOCAL_ID_MARK = "-nuevo-";
const newLocalId = (prefix: string) => `${prefix}${LOCAL_ID_MARK}${Date.now()}-${localIdSequence++}`;

/** true si el id lo generó el formulario (sección o archivo que aún no existe en backend) */
export const isLocalId = (id: string) => id.includes(LOCAL_ID_MARK);

const emptySection = (): NewsFormSection => ({
    id: newLocalId("seccion"),
    encabezado: "",
    contenido: "",
    imagen: null,
});

const fromFile = (file: File): NewsFormFile => ({
    id: newLocalId("archivo"),
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type,
    file,
});

/** TB_RECURSO no guarda nombre de archivo: se toma el último segmento de la URL. */
const nameFromUrl = (url: string, fallback: string) => {
    const lastSegment = url.split(/[?#]/)[0].split("/").filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : fallback;
};

/** Video de YouTube agregado por enlace (no es un archivo: no se sube). */
const YOUTUBE_NAME = "Video de YouTube";
const YOUTUBE_MIME = "video/youtube";

const fromYouTube = (url: string, youtubeId: string, id = newLocalId("video")): NewsFormFile => ({
    id,
    name: YOUTUBE_NAME,
    sizeBytes: null,
    mimeType: YOUTUBE_MIME,
    file: null,
    url,
    youtubeId,
});

const fromRecurso = (recurso: RecursoNoticia): NewsFormFile => {
    // Los videos guardados son enlaces de YouTube (ya no hay MP4).
    const youtubeId = recurso.tipo === TipoRecurso.VIDEO ? parseYouTubeId(recurso.url) : null;
    if (youtubeId) return fromYouTube(toYouTubeWatchUrl(youtubeId), youtubeId, recurso.id);
    return {
        id: recurso.id,
        name: nameFromUrl(recurso.url, recurso.textoAlternativo ?? `Recurso ${recurso.id}`),
        sizeBytes: null,
        mimeType: recurso.tipoMime ?? "",
        file: null,
        url: recurso.url,
    };
};

const emptyValues = (): NewsFormValues => ({
    titulo: "",
    resumen: "",
    autor: NEWS_FORM_DEFAULTS.autor,
    categoriaId: "",
    subcategoriaId: "",
    etiquetaIds: [],
    idioma: NEWS_FORM_DEFAULTS.idioma,
    visibilidad: NEWS_FORM_DEFAULTS.visibilidad,
    fechaPublicacion: "",
    slug: "",
    tiempoLectura: "",
    archivoPrincipal: null,
    secciones: [emptySection()],
    galeria: [],
});

const valuesFromDetalle = (noticia: NoticiaDetalle): NewsFormValues => ({
    titulo: noticia.titulo,
    resumen: noticia.resumen,
    autor: noticia.autor,
    categoriaId: noticia.categoriaId ?? "",
    subcategoriaId: noticia.subcategoriaId ?? "",
    etiquetaIds: noticia.etiquetaIds,
    idioma: noticia.idioma,
    visibilidad: noticia.visibilidad,
    // La API guarda ISO; el formulario muestra dd/mm/aaaa.
    fechaPublicacion: apiDateToDdMmYyyy(noticia.fechaPublicacion),
    slug: noticia.slug,
    tiempoLectura: noticia.tiempoLectura !== null ? String(noticia.tiempoLectura) : "",
    archivoPrincipal: noticia.recursoPrincipal ? fromRecurso(noticia.recursoPrincipal) : null,
    secciones: noticia.secciones.length > 0
        ? [...noticia.secciones]
            .sort((a, b) => a.orden - b.orden)
            .map((seccion) => ({
                id: seccion.id,
                encabezado: seccion.encabezado,
                // El textarea edita texto plano; al guardar se vuelve a convertir con textToHtml.
                contenido: htmlToText(seccion.contenidoHtml),
                imagen: seccion.recurso ? fromRecurso(seccion.recurso) : null,
            }))
        : [emptySection()],
    // La UI muestra galería y adjuntos en una sola lista ("Galería y adjuntos").
    galeria: [...noticia.galeria, ...noticia.adjuntos].map(fromRecurso),
});

/**
 * Estado del formulario de noticias (crear / editar).
 * El componente que lo usa debe montarse cuando `initial` ya está disponible
 * (en edición, después de cargar el detalle), porque solo se lee al inicio.
 */
export function useNewsForm(initial: NoticiaDetalle | null = null) {
    const [values, setValues] = useState<NewsFormValues>(() =>
        initial ? valuesFromDetalle(initial) : emptyValues()
    );
    const [errors, setErrors] = useState<NewsFormErrors>({});
    // En edición el slug ya existe: no se vuelve a sugerir desde el título.
    const [slugEdited, setSlugEdited] = useState(Boolean(initial));

    const clearErrors = useCallback((...paths: string[]) => {
        setErrors((prev) => {
            if (!paths.some((path) => prev[path])) return prev;
            const next = { ...prev };
            paths.forEach((path) => delete next[path]);
            return next;
        });
    }, []);

    const setTitle = useCallback((titulo: string) => {
        setValues((prev) => ({
            ...prev,
            titulo,
            slug: slugEdited ? prev.slug : slugify(titulo),
        }));
        clearErrors("titulo", ...(slugEdited ? [] : ["slug"]));
    }, [slugEdited, clearErrors]);

    const setSlug = useCallback((slug: string) => {
        // Si el usuario borra el slug, se vuelve a sugerir desde el título.
        const isCleared = slug.trim() === "";
        setSlugEdited(!isCleared);
        setValues((prev) => ({ ...prev, slug: isCleared ? slugify(prev.titulo) : slug }));
        clearErrors("slug");
    }, [clearErrors]);

    const setField = useCallback((field: NewsFormTextField, value: string) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
            // Al cambiar de categoría, la subcategoría anterior deja de ser válida.
            ...(field === "categoriaId" && value !== prev.categoriaId ? { subcategoriaId: "" } : {}),
        }));
        clearErrors(field);
    }, [clearErrors]);

    const setTags = useCallback((etiquetaIds: string[]) => {
        setValues((prev) => ({ ...prev, etiquetaIds }));
    }, []);

    const setMainFile = useCallback((file: File | null) => {
        setValues((prev) => ({ ...prev, archivoPrincipal: file ? fromFile(file) : null }));
        clearErrors("archivoPrincipal");
    }, [clearErrors]);

    const addSection = useCallback(() => {
        setValues((prev) => ({ ...prev, secciones: [...prev.secciones, emptySection()] }));
        clearErrors("secciones");
    }, [clearErrors]);

    const updateSection = useCallback((sectionId: string, field: NewsSectionField, value: string) => {
        setValues((prev) => ({
            ...prev,
            secciones: prev.secciones.map((section) =>
                section.id === sectionId ? { ...section, [field]: value } : section
            ),
        }));
        const index = values.secciones.findIndex((section) => section.id === sectionId);
        if (index !== -1) clearErrors(`secciones.${index}.${field}`);
    }, [values.secciones, clearErrors]);

    const setSectionImage = useCallback((sectionId: string, file: File | null) => {
        setValues((prev) => ({
            ...prev,
            secciones: prev.secciones.map((section) =>
                section.id === sectionId ? { ...section, imagen: file ? fromFile(file) : null } : section
            ),
        }));
    }, []);

    // Mover o eliminar secciones cambia los índices: se limpian los errores de secciones.
    const clearSectionErrors = useCallback(() => {
        setErrors((prev) => {
            const keys = Object.keys(prev).filter((key) => key.startsWith("secciones"));
            if (keys.length === 0) return prev;
            const next = { ...prev };
            keys.forEach((key) => delete next[key]);
            return next;
        });
    }, []);

    const moveSection = useCallback((sectionId: string, direction: "up" | "down") => {
        setValues((prev) => {
            const index = prev.secciones.findIndex((section) => section.id === sectionId);
            const target = direction === "up" ? index - 1 : index + 1;
            if (index === -1 || target < 0 || target >= prev.secciones.length) return prev;
            const secciones = [...prev.secciones];
            [secciones[index], secciones[target]] = [secciones[target], secciones[index]];
            return { ...prev, secciones };
        });
        clearSectionErrors();
    }, [clearSectionErrors]);

    const removeSection = useCallback((sectionId: string) => {
        setValues((prev) => {
            if (prev.secciones.length <= 1) return prev;
            return { ...prev, secciones: prev.secciones.filter((section) => section.id !== sectionId) };
        });
        clearSectionErrors();
    }, [clearSectionErrors]);

    const addGalleryFiles = useCallback((files: File[]) => {
        setValues((prev) => ({ ...prev, galeria: [...prev.galeria, ...files.map(fromFile)] }));
    }, []);

    // Videos de YouTube: en el recurso principal y en la sección reemplazan lo que había.
    const setMainVideo = useCallback((url: string, youtubeId: string) => {
        setValues((prev) => ({ ...prev, archivoPrincipal: fromYouTube(url, youtubeId) }));
        clearErrors("archivoPrincipal");
    }, [clearErrors]);

    const setSectionVideo = useCallback((sectionId: string, url: string, youtubeId: string) => {
        setValues((prev) => ({
            ...prev,
            secciones: prev.secciones.map((section) =>
                section.id === sectionId ? { ...section, imagen: fromYouTube(url, youtubeId) } : section
            ),
        }));
    }, []);

    const addGalleryVideo = useCallback((url: string, youtubeId: string) => {
        setValues((prev) => ({ ...prev, galeria: [...prev.galeria, fromYouTube(url, youtubeId)] }));
    }, []);

    /** Marca un error que viene de backend en un campo (p. ej. slug repetido). */
    const setFieldError = useCallback((path: string, message: string) => {
        setErrors((prev) => ({ ...prev, [path]: message }));
    }, []);

    const removeGalleryFile = useCallback((fileId: string) => {
        setValues((prev) => ({ ...prev, galeria: prev.galeria.filter((file) => file.id !== fileId) }));
    }, []);

    /**
     * Valida con Zod según el modo. Devuelve true si es válido.
     */
    const validate = useCallback((mode: NewsValidationMode): boolean => {
        const nextErrors = validateNewsForm(values, mode);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }, [values]);

    // Fecha posterior a hoy (hora de Guatemala) = programar; hoy o antes = publicar ya.
    const publishIntent: PublishIntent = useMemo(() => {
        const fecha = ddMmYyyyToIsoDate(values.fechaPublicacion);
        return fecha && fecha > todayIsoDateGuatemala() ? "programar" : "publicar";
    }, [values.fechaPublicacion]);

    return {
        values,
        errors,
        publishIntent,
        validate,
        setTitle,
        setSlug,
        setField,
        setTags,
        setMainFile,
        addSection,
        updateSection,
        setSectionImage,
        moveSection,
        removeSection,
        addGalleryFiles,
        removeGalleryFile,
        setMainVideo,
        setSectionVideo,
        addGalleryVideo,
        setFieldError,
    };
}
