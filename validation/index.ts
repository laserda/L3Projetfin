import { z } from "zod";

// Schéma de validation pour le formulaire de suivi
export const suiviFormSchema = z.object({
    reference: z.string().min(5, {
        message: "La référence doit contenir au moins 5 caractères",
    }),
});
export type SuiviFormValues = z.infer<typeof suiviFormSchema>;

// Schéma pour le formulaire de suivi par email
export const emailFormSchema = z.object({
    email: z.string().email({
        message: "Veuillez saisir une adresse email valide",
    }),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;

// Schéma de validation
export const demandeFormSchema = z.object({
    type: z.enum(["naissance", "mariage", "deces"], {
        required_error: "Veuillez sélectionner un type de document",
    }),
    nom: z.string().min(2, {
        message: "Le nom doit contenir au moins 2 caractères",
    }),
    prenom: z.string().min(2, {
        message: "Le prénom doit contenir au moins 2 caractères",
    }),
    parents: z.string().optional(),
    date: z.string().min(1, {
        message: "Veuillez sélectionner une date",
    }),
    lieu: z.string().min(2, {
        message: "Veuillez indiquer un lieu",
    }),
    email: z.string().email({
        message: "Veuillez saisir une adresse email valide",
    }),
    paymentConfirmed: z.boolean().refine((val) => val === true, {
        message: "Vous devez confirmer le paiement des frais de timbre",
    }),
});

export type DemandeFormValues = z.infer<typeof demandeFormSchema>;

// Schéma de validation pour le formulaire de connexion
export const loginFormSchema = z.object({
    email: z.string().email({
        message: "Veuillez saisir une adresse email valide",
    }),
    password: z.string().min(6, {
        message: "Le mot de passe doit contenir au moins 6 caractères",
    }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// Schéma de validation pour le formulaire de connexion
export const RegisterFormSchema = z.object({
    email: z.string().email({
        message: "Veuillez saisir une adresse email valide",
    }),
    password: z.string().min(6, {
        message: "Le mot de passe doit contenir au moins 6 caractères",
    }),
    name: z.string().min(2, {
        message: "Le nom doit contenir au moins 2 caractères",
    }),
    // role: z.enum(["admin", "agent", "citoyen"]).nullable(),
});

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
