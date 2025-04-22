"use server";

import { auth } from "@/lib/auth";
import { LoginFormValues } from "@/validation";
import { headers } from "next/headers";

export async function signIn(data: LoginFormValues) {
    const { email, password } = data;
    if (!email || !password) {
        throw new Error("Email et mot de passe manquants");
    } else {
        const res = await auth.api.signInEmail({ body: { email, password } });
        return res.user.id;
    }
}

export async function signUp() {
    await auth.api.signUpEmail({
        body: { email: "admin@admin.com", password: "password", name: "Admin" },
    });
}

export async function getUser() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}
