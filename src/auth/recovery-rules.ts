import { z } from "zod";

/**
 * Reglas de recuperación de contraseña, compartidas por el formulario (mensajes para la persona) y
 * por la ruta del servidor (`recovery.server.ts`), para que lo que el formulario acepta sea
 * exactamente lo que el servidor acepta.
 */
export const RECOVERY_SYMBOLS = "@$!%*?&ñáéíóú";

export const recoveryEmail = z
    .string()
    .trim()
    .min(1, "Escribe tu correo institucional.")
    .max(254, "El correo admite hasta 254 caracteres.")
    .email("Escribe el correo completo, por ejemplo nombre@muniguate.com.");

export const recoveryCode = z.string().regex(/^\d{6}$/, "Escribe los 6 dígitos del código que recibiste.");

export const recoveryPassword = z
    .string()
    .min(8, "La contraseña necesita al menos 8 caracteres.")
    .max(128, "La contraseña admite hasta 128 caracteres.")
    .regex(/[a-z]/, "Incluye al menos una letra minúscula.")
    .regex(/[A-Z]/, "Incluye al menos una letra mayúscula.")
    .regex(/\d/, "Incluye al menos un número.")
    .regex(/[@$!%*?&ñáéíóú]/, `Incluye al menos un símbolo: ${RECOVERY_SYMBOLS.split("").join(" ")}`)
    .regex(
        /^[A-Za-z\d@$!%*?&ñáéíóú]+$/,
        "Usa solo letras sin tilde, números y los símbolos indicados (sin espacios).",
    );
