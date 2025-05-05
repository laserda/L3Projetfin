import { db } from "@/db";
import { paiement } from "@/db/schema";
import { eq } from "drizzle-orm";

// 📥 Créer un paiement
export const createPaiement = async (data: typeof paiement.$inferInsert) => {
    return await db.insert(paiement).values(data).returning();
};

// 🔍 Paiement par ID
export const getPaiementById = async (id: string) => {
    return await db.query.paiement.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
    });
};
