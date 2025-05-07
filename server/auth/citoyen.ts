"use server";

import { db } from "@/db";
import { citoyen } from "@/db/schema";

import {
    createSession,
    deleteSession,
    getSession,
} from "../sessions/citoyen_session";
import { redirect } from "next/navigation";

import { loginSchema, registerSchema } from "@/validation/validation-citoyen";
import { hashPassword, verifyPassword } from "@/lib/hashPassword";

export async function login(formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            succes: false,
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
                    password: ["Mot de passe incorrect"],
                    succes: false,
                },
            };
        }

        await createSession(isCitoyen.id);
        return {
            errors: null,
            succes: true,
        };
    } catch (error) {
        console.log(error);
    }
}

export async function register(formData: FormData) {
    const result = registerSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            succes: false,
        };
    }
    try {
        const isCitoyen = await getCitoyenByEmail(result.data.email);
        if (isCitoyen) {
            return {
                errors: {
                    email: ["Cet email est déjà utilisé"],
                    succes: false,
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
        return {
            errors: null,
            succes: true,
        };
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
