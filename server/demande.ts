import { db } from "@/db";
import { demande } from "@/db/schema";
import { eq } from "drizzle-orm";

// 📥 Créer une demande
export const createDemande = async (data: typeof demande.$inferInsert) => {
    return await db.insert(demande).values(data).returning();
};

// 📃 Toutes les demandes
export const getAllDemandes = async () => {
    return await db.select().from(demande);
};

// 🔍 Une demande par ID
export const getDemandeById = async (id: string) => {
    return await db.query.demande.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
    });
};

// ✏️ Modifier une demande
export const updateDemande = async (
    id: string,
    updates: Partial<typeof demande.$inferInsert>
) => {
    return await db
        .update(demande)
        .set(updates)
        .where(eq(demande.id, id))
        .returning();
};

// ❌ Supprimer une demande
export const deleteDemande = async (id: string) => {
    return await db.delete(demande).where(eq(demande.id, id));
};
