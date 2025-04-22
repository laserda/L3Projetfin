import { z } from "zod";

// Validations du formulaire
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
