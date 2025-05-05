import { db } from "@/db";
import { citoyen } from "@/db/schema";
import { eq } from "drizzle-orm";

// 📥 Créer un citoyen
export const createCitoyen = async (data: typeof citoyen.$inferInsert) => {
    return await db.insert(citoyen).values(data).returning();
};

// 📃 Obtenir tous les citoyens
export const getAllCitoyens = async () => {
    return await db.select().from(citoyen);
};

// 🔍 Obtenir un citoyen par ID
export const getCitoyenById = async (id: string) => {
    return await db.query.citoyen.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
    });
};

// ✏️ Mettre à jour un citoyen
export const updateCitoyen = async (
    id: string,
    updates: Partial<typeof citoyen.$inferInsert>
) => {
    return await db
        .update(citoyen)
        .set(updates)
        .where(eq(citoyen.id, id))
        .returning();
};

// ❌ Supprimer un citoyen
export const deleteCitoyen = async (id: string) => {
    return await db.delete(citoyen).where(eq(citoyen.id, id));
};
