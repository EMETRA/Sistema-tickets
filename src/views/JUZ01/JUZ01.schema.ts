import { z } from "zod";

export const JUZ01Schema = z.object({
    caseNumber: z
        .string()
        .trim()
        .regex(/^[A-Za-z0-9_-]{3,36}$/, {
            message:
        "Escribe al menos los primeros 3 caracteres o el código completo del caso (hasta 36).",
        }),
});

export type JUZ01FormValues = z.infer<typeof JUZ01Schema>;
