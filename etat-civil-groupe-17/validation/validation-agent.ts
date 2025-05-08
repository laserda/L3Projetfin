import { z } from "zod";

export const loginSchema = z.object({
    Email: z.string().email({ message: "Invalid email address" }).trim(),
    Password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
});
export const registerSchema = z.object({
    Nom: z
        .string()
        .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
        .trim(),
    Email: z.string().email({ message: "Invalid email address" }).trim(),
    Password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
    Role: z.enum(["admin", "agent"]).default("agent").optional(),

});
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
