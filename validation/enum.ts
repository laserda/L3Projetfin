import { z } from "zod";

export const ZTypeActe = z.enum(["naissance", "mariage", "décès"]);
export const ZStatutDemande = z.enum([
    "soumise",
    "en_traitement",
    "validée",
    "refusée",
    "livrée",
]);
export const ZModePaiement = z.enum([
    "mobile_money",
    "carte_bancaire",
    "virement",
]);
export const ZTypeEntite = z.enum(["demande", "acte"]);
