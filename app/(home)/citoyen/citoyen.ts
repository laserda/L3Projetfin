import { db } from "@/db";
import { demande } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { auth } from "@/lib/auth";

import { DemandeSchemaType } from "@/validation/demandes.type";

export const getDemandesList = async (userId: string) => {
    const res = await db
        .select()
        .from(demande)
        .where(eq(demande.citoyenId, userId));
    return res;
};

export const createDemande = async (
    values: DemandeSchemaType,
    userId: string,
    paiementId: string
) => {
    const res = await db.insert(demande).values({
        citoyen_id: userId,
        typeActe: values.typeActe,
        dateDemande: values.dateDemande,
        paiementId: paiementId,
        statut: "soumise",
    });
    return res;
};
