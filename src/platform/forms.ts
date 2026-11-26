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

/** Valor vacío del formulario ("" o null) → undefined, para tratarlo como «sin dato». */
const vacio = (v: unknown) => (v === "" || v === null ? undefined : v);

/** Esquema de un campo de la plataforma según su definición (mismas reglas que valida el API). */
export function esquemaCampo(field: Field): z.ZodType {
    const { label } = field;
    let schema: z.ZodType;
    switch (field.type) {
        case "number": {
            let n = z.coerce.number({ error: mensajes.numero(label) });
            if (field.min !== undefined) n = n.min(field.min, mensajes.rango(label, field.min, field.max));
            if (field.max !== undefined) n = n.max(field.max, mensajes.rango(label, field.min, field.max));
            schema = n;
            break;
        }
        case "date":
        case "datetime":
            schema = z.string().refine((v) => Number.isFinite(+new Date(v)), mensajes.fecha(label));
            break;
        case "select":
            schema = field.options?.length
                ? z.enum(field.options as [string, ...string[]], { error: mensajes.opcion(label) })
                : z.string();
            break;
        case "url":
            schema = z.url({ protocol: /^https?$/, error: mensajes.enlace(label) });
            break;
        case "boolean":
            schema = z.boolean();
            break;
        case "list":
            schema = z.array(z.union([z.number(), z.string()]));
            break;
        case "textarea":
            schema = z.string().max(8000, mensajes.maximo(label, 8000));
            break;
        default:
            schema = z.union([z.string().max(500, mensajes.maximo(label, 500)), z.number()]);
    }
    if (field.required) {
        if (field.type === "list")
            return z.array(z.union([z.number(), z.string()])).min(1, mensajes.requerido(label));
        // Vacío → undefined; si falta, un solo mensaje claro en lugar del error de tipo.
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
