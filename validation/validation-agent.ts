import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
});
export const registerSchema = z.object({
    nom: z
        .string()
        .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
        .trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
    role: z.enum(["admin", "agent"]).default("agent").optional(),

    // prenom: z
    //     .string()
    //     .min(3, { message: "Le prénom doit contenir au moins 3 caractères" })
    //     .trim(),
    // dateNaissance: z.string({ message: "Date de naissance invalide" }).trim(),
    // lieuNaissance: z
    //     .string()
    //     .min(3, { message: "Lieu de naissance invalide" })
    //     .trim(),
    // telephone: z
    //     .string()
    //     .min(10, { message: "Numéro de téléphone invalide" })
    //     .trim(),
});
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
