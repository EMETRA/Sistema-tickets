import { z } from "zod";
import { nameSchema, emailSchema, passwordSchema, phoneSchema, nitSchema, dpiSchema, birthDateSchema } from "@/schema/commonSchemas";

export const createAnalistSchema = z.object({
    name: nameSchema,
    lastName: nameSchema,
    dpi: dpiSchema,
    nit: nitSchema,
    email: emailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    birthDate: birthDateSchema,
});