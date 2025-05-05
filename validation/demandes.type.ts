import { z } from "zod";

// Validations du formulaire
export const demandeSchema = z.object({
    typeActe: z.enum(["naissance", "mariage", "deces"], {
        required_error: "Veuillez sélectionner un type de document",
    }),

    dateDemande: z.string().min(1, {
        message: "Veuillez sélectionner une date",
    }),

    // paiementId: z.string().min(10, {
    //     message: "Vous devez confirmer le paiement des frais de timbre",
    // }),
});

export type DemandeSchemaType = z.infer<typeof demandeSchema>;
