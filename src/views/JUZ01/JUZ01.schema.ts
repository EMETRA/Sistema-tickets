import { z } from 'zod';

export const JUZ01Schema = z.object({
    caseNumber: z.string().trim().min(1, { message: 'El código de caso es requerido' }),
});

export type JUZ01FormValues = z.infer<typeof JUZ01Schema>;
