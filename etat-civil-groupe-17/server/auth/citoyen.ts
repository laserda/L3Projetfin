"use server";

import { CitoyenRepository } from './repositories/citoyenRepository'

import {
    createSession,
    deleteSession,
    getSession,
} from "../sessions/citoyen_session";
import { redirect } from "next/navigation";

import { loginSchema, registerSchema } from "@/validation/validation-citoyen";
import { hashPassword, verifyPassword } from "@/lib/hashPassword";
import { ErrorsMessage } from '@/enums/errors-message';
import { ResultData } from '@/types';
const citoyenRepo = new CitoyenRepository()

export async function login(formData: FormData): Promise<ResultData> {

    try {

        const result = loginSchema.safeParse(Object.fromEntries(formData));
        if (!result.success) {
            return {
                error: ErrorsMessage.errors,
            };
        }

        const isCitoyen = await getCitoyenByEmail(result.data.Email);

        if (!isCitoyen) {
            return {
                error: "Email ou Mot de passe incorrect"
            };
        }
        const isPasswordCorrect = await verifyPassword(
            result.data.Password,
            isCitoyen.Password
        );
        if (!isPasswordCorrect) {
            return {
                error: "Email ou Mot de passe incorrect",
            };
        }

        await createSession(isCitoyen.ID_Citoyen);
        return {
            success: true,
        };
    } catch (error) {
        return {
            error: ErrorsMessage.errors,
        };
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
        const isCitoyen = await getCitoyenByEmail(result.data.Email);
        if (isCitoyen) {
            return {
                errors: {
                    email: ["Cet email est déjà utilisé"],
                    succes: false,
                },
            };
        }

        const hashedPassword = await hashPassword(result.data.Password);

        const newCitoyen = await citoyenRepo.create({
            data: {
                ...result.data,
                DateNaissance: new Date("1993-01-01T00:00:00.000Z"),// a corriger new Date(result.data.DateNaissance),
                Password: hashedPassword,
            }
        })
        await createSession(newCitoyen.ID_Citoyen);
        return {
            errors: null,
            succes: true,
        };
    } catch (e) {
        console.log(e);
    }
}

export const getCitoyenById = async (id: string) => {
    const user = await citoyenRepo.findById(id);
    return user;
};
const getCitoyenByEmail = async (email: string) => {
    return await citoyenRepo.findByEmail(email);
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