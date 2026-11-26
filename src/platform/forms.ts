import { z } from "zod";
import type { Field } from "./types";

/**
 * Validación de formularios con zod + react-hook-form.
 *
 * Los mensajes son frases cortas y concretas («Completa «Nombre».»), iguales en
 * todos los formularios y alineadas con lo que valida el API. Cada formulario
 * declara su esquema con estos ayudantes y lo usa con `zodResolver(esquema)`.
 */
export const mensajes = {
    requerido: (label: string) => `Completa «${label}».`,
    maximo: (label: string, max: number) => `«${label}» admite hasta ${max} caracteres.`,
    numero: (label: string) => `Escribe un número en «${label}».`,
    rango: (label: string, min?: number, max?: number) =>
        min !== undefined && max !== undefined
            ? `«${label}» debe estar entre ${min} y ${max}.`
            : min !== undefined
              ? `«${label}» debe ser ${min} o más.`
              : `«${label}» debe ser ${max} o menos.`,
    fecha: (label: string) => `Escribe una fecha válida en «${label}».`,
    opcion: (label: string) => `Elige una opción de la lista en «${label}».`,
    enlace: (label: string) => `Pega el enlace completo en «${label}» (empieza con https://).`,
};

/** Texto obligatorio u opcional, sin espacios sobrantes. */
export function texto(label: string, { requerido = false, max = 200 } = {}) {
    const base = z.string().trim().max(max, mensajes.maximo(label, max));
    return requerido ? base.min(1, mensajes.requerido(label)) : base;
}

/** Valor vacío ("", solo espacios o null) → undefined, para tratarlo como «sin dato» (como el API). */
const vacio = (v: unknown) => (v === null || (typeof v === "string" && !v.trim()) ? undefined : v);

/**
 * Esquema de un campo de la plataforma según su definición. Reproduce las reglas del API
 * (api-tickets: platform.validation.ts `validData`): enteros desde 1, listas de hasta 100
 * personas, textos de hasta 500 caracteres (8000 en descripciones), fechas exactas y enlaces
 * http(s) sin usuario ni contraseña.
 */
export function esquemaCampo(field: Field): z.ZodType {
    const { label } = field;
    let schema: z.ZodType;
    switch (field.type) {
        case "number":
        case "user": {
            const min = field.min ?? 1;
            let n = z.coerce
                .number({ error: mensajes.numero(label) })
                .int(mensajes.numero(label))
                .min(min, mensajes.rango(label, min, field.max));
            if (field.max !== undefined) n = n.max(field.max, mensajes.rango(label, min, field.max));
            schema = field.type === "user" ? z.coerce.number().int().positive(mensajes.opcion(label)) : n;
            break;
        }
        case "datetime":
            schema = z
                .string()
                .refine(
                    (v) => /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v)),
                    mensajes.fecha(label),
                );
            break;
        case "date":
            schema = z
                .string()
                .refine(
                    (v) =>
                        /^\d{4}-\d\d-\d\d$/.test(v) &&
                        Number.isFinite(Date.parse(v)) &&
                        new Date(v).toISOString().slice(0, 10) === v,
                    mensajes.fecha(label),
                );
            break;
        case "select":
            schema = field.options?.length
                ? z.enum(field.options as [string, ...string[]], { error: mensajes.opcion(label) })
                : z.string();
            break;
        case "url":
            schema = z.string().refine((v) => {
                try {
                    const url = new URL(v.trim());
                    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
                } catch {
                    return false;
                }
            }, mensajes.enlace(label));
            break;
        case "ref":
            schema = z.string().uuid(mensajes.opcion(label));
            break;
        case "boolean":
            schema = z.boolean();
            break;
        case "list":
            schema = z
                .array(z.coerce.number().int().positive())
                .max(100, `«${label}» admite hasta 100 personas.`);
            break;
        case "textarea":
            schema = z.string().max(8000, mensajes.maximo(label, 8000));
            break;
        default:
            schema = z.string().max(500, mensajes.maximo(label, 500));
    }
    if (field.required) {
        if (field.type === "list") return (schema as z.ZodArray<z.ZodType>).min(1, mensajes.requerido(label));
        // Vacío o solo espacios → undefined; si falta, un solo mensaje claro en lugar del error de tipo.
        return z
            .preprocess(vacio, schema.optional())
            .refine((v) => v !== undefined, { error: mensajes.requerido(label) });
    }
    return z.preprocess(vacio, schema.optional());
}

/** Esquema de los datos de un registro (`datos`) a partir de las definiciones de sus campos. */
export function esquemaDatos(fields: Field[]) {
    return z.object(Object.fromEntries(fields.map((f) => [f.key, esquemaCampo(f)]))).loose();
}
