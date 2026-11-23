import { z } from "zod";

export const JUZ01Schema = z.object({
    caseNumber: z
        .string()
        .trim()
        .regex(/^(?:[A-Za-z0-9_ -]{3,36}|[1-9]\d?)$/, {
            message:
        "Escribe el número de multa, la placa o al menos 3 caracteres del caso.",
        }),
});

export type JUZ01FormValues = z.infer<typeof JUZ01Schema>;
