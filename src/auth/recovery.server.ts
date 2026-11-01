import "server-only";
import { z } from "zod";

const requestSchema = z
    .object({ correo: z.string().email().max(254) })
    .strict();
const passwordSchema = z
    .object({
        OTP: z.string().regex(/^\d{6}$/),
        clave: z
            .string()
            .min(8)
            .max(128)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&ñáéíóú])[A-Za-z\d@$!%*?&ñáéíóú]{8,}$/,
            ),
    })
    .strict();

export async function recoveryRequest(
    request: Request,
    method: "POST" | "PUT",
) {
    const unavailable =
    "La recuperación no está disponible. Contacta a Informática para restablecer tu acceso.";
    const response = (body: object, status: number) =>
        Response.json(body, {
            status,
            headers: { "Cache-Control": "no-store" },
        });
    const reader = request.body?.getReader();
    let raw = "";
    if (reader) {
        const decoder = new TextDecoder();
        let bytes = 0;
        for (;;) {
            const part = await reader.read();
            if (part.done) {
                raw += decoder.decode();
                break;
            }
            bytes += part.value.byteLength;
            if (bytes > 4096) {
                await reader.cancel();
                return response({ message: "La solicitud no es válida." }, 400);
            }
            raw += decoder.decode(part.value, { stream: true });
        }
    }
    let body: unknown;
    try {
        body = JSON.parse(raw);
    } catch {
        return response({ message: "La solicitud no es válida." }, 400);
    }
    const validated = (
        method === "POST" ? requestSchema : passwordSchema
    ).safeParse(body);
    if (!validated.success)
        return response(
            {
                message:
          method === "POST"
              ? "Revisa el correo electrónico."
              : "Revisa el código y los requisitos de la contraseña.",
            },
            400,
        );
    const base = process.env.AUTH_RECOVERY_BASE_URL?.trim();
    if (!base) return response({ message: unavailable }, 503);
    try {
        const url = new URL(base.endsWith("/") ? base : base + "/");
        if (
            !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
        )
            return response({ message: unavailable }, 503);
        const upstream = await fetch(
            new URL(
                method === "POST" ? "send-recovery-email" : "recover-password",
                url,
            ),
            {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validated.data),
                cache: "no-store",
                redirect: "error",
                signal: AbortSignal.timeout(15000),
            },
        );
        await upstream.body?.cancel();
        if (
            method === "POST" &&
      (upstream.ok || [400, 401, 403, 404].includes(upstream.status))
        )
            return response(
                {
                    message:
            "Si la cuenta puede recuperarse, recibirás un código en tu correo.",
                },
                200,
            );
        if (method === "PUT" && upstream.ok)
            return response(
                {
                    message: "Contraseña actualizada. Ya puedes iniciar sesión.",
                },
                200,
            );
        if (upstream.status === 429)
            return response(
                {
                    message:
            "Has realizado varias solicitudes. Espera unos minutos antes de intentar nuevamente.",
                },
                429,
            );
        if (method === "PUT" && upstream.status >= 400 && upstream.status < 500)
            return response(
                {
                    message:
            "No se pudo validar el código o la contraseña. Revisa los datos o solicita otro código.",
                },
                400,
            );
        return response({ message: unavailable }, 503);
    } catch {
        return response({ message: unavailable }, 503);
    }
}
