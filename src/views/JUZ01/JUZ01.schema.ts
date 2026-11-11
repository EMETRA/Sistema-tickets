import { z } from "zod";

export const JUZ01Schema = z.object({
    caseNumber: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9_-]{6,36}$/, {
            message:
        "Escribe los primeros 6 caracteres o el código completo del caso (hasta 36).",
        }),
});

export type JUZ01FormValues = z.infer<typeof JUZ01Schema>;
