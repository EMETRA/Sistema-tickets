import { z } from "zod";
import type { NewsFormErrors } from "@/components/client/organisms/NewsForm";

const requiredText = (message: string) => z.string().trim().min(1, message);

const fileSchema = z.object({
    id: z.string(),
    name: z.string(),
    sizeBytes: z.number().nullable(),
    mimeType: z.string(),
    file: z.custom<File>().nullable(),
    url: z.string().optional(),
});

const sectionSchema = z.object({
    id: z.string(),
    encabezado: requiredText("El encabezado es obligatorio"),
    contenido: requiredText("El contenido es obligatorio"),
    imagen: fileSchema.nullable(),
});

/**
 * Validación completa: se usa al publicar/programar y en la vista previa.
 */
export const newsPublishSchema = z.object({
    titulo: requiredText("El título es obligatorio"),
    resumen: requiredText("El resumen es obligatorio"),
    autor: requiredText("El autor es obligatorio"),
    categoriaId: requiredText("Selecciona una categoría"),
    subcategoriaId: z.string(),
    etiquetaIds: z.array(z.string()),
    idioma: requiredText("Selecciona un idioma"),
    visibilidad: requiredText("Selecciona la visibilidad"),
    fechaPublicacion: requiredText("La fecha de publicación es obligatoria")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    slug: requiredText("La URL (slug) es obligatoria")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa solo minúsculas, números y guiones"),
    tiempoLectura: z.string().trim().refine(
        (value) => value === "" || (/^\d+$/.test(value) && Number(value) > 0),
        "Ingresa un número entero mayor a 0",
    ),
    archivoPrincipal: fileSchema.nullable().refine(
        (value) => value !== null,
        "La imagen o video principal es obligatorio",
    ),
    secciones: z.array(sectionSchema).min(1, "Agrega al menos una sección"),
    galeria: z.array(fileSchema),
});

/**
 * Validación de borrador: solo exige el título.
 */
export const newsDraftSchema = z.object({
    titulo: requiredText("El título es obligatorio"),
});

export type NewsValidationMode = "publicar" | "borrador";

/**
 * Valida los valores y devuelve los errores por ruta ("titulo", "secciones.1.contenido", ...).
 * Un objeto vacío significa que el formulario es válido.
 */
export function validateNewsForm(values: unknown, mode: NewsValidationMode): NewsFormErrors {
    const schema = mode === "publicar" ? newsPublishSchema : newsDraftSchema;
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: NewsFormErrors = {};
    result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!errors[path]) errors[path] = issue.message;
    });
    return errors;
}
