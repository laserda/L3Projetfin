"use server";

import { db } from "@/db";
import { citoyen } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
    createSession,
    deleteSession,
    getSession,
} from "../sessions/citoyen_session";
import { redirect } from "next/navigation";

import { loginSchema, registerSchema } from "@/validation/validation-citoyen";
import { hashPassword, verifyPassword } from "@/lib/hashPassword";

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }
    try {
        const isCitoyen = await getCitoyenByEmail(result.data.email);
        if (!isCitoyen) {
            return {
                errors: {
                    email: ["Informations incorrectes"],
                },
            };
        }
        const isPasswordCorrect = await verifyPassword(
            result.data.password,
            isCitoyen.password
        );
        if (!isPasswordCorrect) {
            return {
                errors: {
                    password: ["Mail ou Mot de passe incorrect"],
                },
            };
        }

        await createSession(isCitoyen.id);
        return redirect("/");
    } catch (error) {
        console.log(error);
    }
}

export async function register(prevState: any, formData: FormData) {
    const result = registerSchema.safeParse(Object.fromEntries(formData));
    console.log(result.data);
    
    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }
    try {
        const isCitoyen = await getCitoyenByEmail(result.data.email);
        if (isCitoyen) {
            return {
                errors: {
                    email: ["Cet email est déjà utilisé"],
                },
            };
        }

        const hashedPassword = await hashPassword(result.data.password);

        const newCitoyen = await db
            .insert(citoyen)
            .values({
                ...result.data,
                dateNaissance: new Date(result.data.dateNaissance),
                password: hashedPassword,
            })
            .returning();

        await createSession(newCitoyen[0].id);
        return redirect("/");
    } catch (e) {
        console.log(e);
    }
}

export const getCitoyenById = async (id: string) => {
    const user = await db.query.citoyen.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
        columns: {
            password: false,
        },
    });
    return user;
};
const getCitoyenByEmail = async (email: string) => {  
    return await db.query.citoyen.findFirst({
        where: (fields, { eq }) => eq(fields.email, email),
    });
};

export async function logout() {
    await deleteSession();
    redirect("/");
}

export async function getCitoyen() {
    const session = await getSession();
    if (!session) return null;
    return await getCitoyenById(session?.userId as string);
}

// // 📥 Créer un citoyen
// export const createCitoyen = async (data) => {
//     return await db.insert(citoyen).values(data).returning();
// };

// // 📃 Obtenir tous les citoyens
// export const getAllCitoyens = async () => {
//     return await db.select().from(citoyen);
// };

// // 🔍 Obtenir un citoyen par ID

// // ✏️ Mettre à jour un citoyen
// export const updateCitoyen = async (
//     id: string,
//     updates: Partial<typeof citoyen.$inferInsert>
// ) => {
//     return await db
//         .update(citoyen)
//         .set(updates)
//         .where(eq(citoyen.id, id))
//         .returning();
// };

// // ❌ Supprimer un citoyen
// export const deleteCitoyen = async (id: string) => {
//     return await db.delete(citoyen).where(eq(citoyen.id, id));
// };
