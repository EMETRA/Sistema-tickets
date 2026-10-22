import { z } from "zod";

export const nameSchema = z.string().min(1, "El nombre es requerido");

export const emailSchema = z.email("El email es requerido");

export const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

export const phoneSchema = z.string().min(8, "El teléfono es requerido").max(8, "El teléfono no puede tener más de 8 dígitos");

export const nitSchema = z
    .string()
    .min(1, "El NIT es requerido")
    .max(10, "El NIT no puede tener más de 10 dígitos")
    .refine((value) => {
        return value.match(/^[0-9a-zA-Z]{8,9}$/);
    }, "El NIT debe tener 8 o 9 caracteres. Sin espacios o guiones");

export const dpiSchema = z.
    string()
    .min(1, "El DPI es requerido")
    .max(13, "El DPI no puede tener más de 13 dígitos")
    .refine((value) => {
        return value.match(/^\d{13}$/);
    }, "El DPI debe tener 13 dígitos. Sin espacios");

export const birthDateSchema = z.string().refine((value) => {
    return value.match(/^\d{4}-\d{2}-\d{2}$/);
}, "La fecha de nacimiento debe tener el formato yyyy-mm-dd");
