import { z } from "zod";

// Connexion : on vérifie seulement que les champs sont remplis et que l'e-mail
// est bien formé ; aucune règle de longueur pour ne pas bloquer les comptes existants.
export const loginSchema = z.object({
  Email: z
    .string()
    .trim()
    .min(1, { message: "Veuillez saisir votre adresse e-mail." })
    .email({ message: "Veuillez saisir une adresse e-mail valide." }),
  Password: z
    .string()
    .trim()
    .min(1, { message: "Veuillez saisir votre mot de passe." }),
});
export const registerSchema = z.object({
  Nom: z
    .string()
    .min(1, { message: "Veuillez saisir votre nom." })
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
    .trim(),
  Prenom: z
    .string()
    .min(1, { message: "Veuillez saisir votre prénom." })
    .min(3, { message: "Le prénom doit contenir au moins 3 caractères" })
    .trim(),
  Email: z
    .string()
    .min(1, { message: "Veuillez saisir votre adresse e-mail." })
    .email({ message: "Veuillez saisir une adresse e-mail valide." })
    .trim(),
  Password: z
    .string()
    .min(1, { message: "Veuillez saisir votre mot de passe." })
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." })
    .trim(),
  Role: z.enum(["Administrateur", "Agent"]).default("Agent").optional(),
});
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
