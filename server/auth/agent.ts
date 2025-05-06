"use server";

import { db } from "@/db";
import { agent } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
    createSession,
    deleteSession,
    getSession,
} from "../sessions/agent_session";
import { redirect } from "next/navigation";

import { loginSchema, registerSchema } from "@/validation/validation-agent";
import { hashPassword, verifyPassword } from "@/lib/hashPassword";

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }
    try {
        const isAgent = await getAgentByEmail(result.data.email);
        if (!isAgent) {
            return {
                errors: {
                    email: ["Informations incorrectes"],
                },
            };
        }
        const isPasswordCorrect = await verifyPassword(
            result.data.password,
            isAgent.password
        );
        if (!isPasswordCorrect) {
            return {
                errors: {
                    password: ["Mot de passe incorrect"],
                },
            };
        }

        await createSession(isAgent.id, isAgent.role);
        return {
            redirectTo: "/admin/dashboard",
        };
    } catch (error) {
        console.log(error);
    }
}

export async function register(prevState: any, formData: FormData) {
    const result = registerSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }
    try {
        const isAgent = await getAgentByEmail(result.data.email);
        if (isAgent) {
            return {
                errors: {
                    email: ["Cet email est déjà utilisé"],
                },
            };
        }

        const hashedPassword = await hashPassword(result.data.password);

        const newAgent = await db
            .insert(agent)
            .values({
                ...result.data,
                password: hashedPassword,
            })
            .returning();

        await createSession(newAgent[0].id, newAgent[0].role);
        return {
            redirectTo: "/admin/dashboard",
        };
    } catch (e) {
        console.log(e);
    }
}

export const getAgentById = async (id: string) => {
    const user = await db.query.agent.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
        columns: {
            password: false,
        },
    });
    return user;
};
const getAgentByEmail = async (email: string) => {
    return await db.query.agent.findFirst({
        where: (fields, { eq }) => eq(fields.email, email),
    });
};

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function getAgent() {
    const session = await getSession();
    if (!session) return null;
    return await getAgentById(session?.userId as string);
}

export async function getAllAgents() {
    const agents = await db.select().from(agent);
    return agents;
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
