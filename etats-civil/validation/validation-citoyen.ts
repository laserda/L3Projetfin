import { z } from "zod";

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

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
    prenom: z
        .string()
        .min(3, { message: "Le prénom doit contenir au moins 3 caractères" })
        .trim(),
    email: z.string().email({ message: "Invalid email address" }).trim(),
    dateNaissance: z.string({ message: "Date de naissance invalide" }).trim(),
    lieuNaissance: z
        .string()
        .min(3, { message: "Lieu de naissance invalide" })
        .trim(),
    telephone: z
        .string()
        .min(10, { message: "Numéro de téléphone invalide" })
        .trim(),
    adresse: z.string().min(3, { message: "Adresse invalide" }).trim(),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .trim(),
});
