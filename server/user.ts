// "use server";

// // import { db } from "@/db";
// // import { user } from "@/db/schema";
// import { auth } from "@/lib/auth";
// import { LoginFormValues, RegisterFormValues } from "@/validation";
// import { revalidatePath } from "next/cache";
// import { headers } from "next/headers";

// export async function signIn(data: LoginFormValues) {
//     const { email, password } = data;
//     if (!email || !password) {
//         throw new Error("Email et mot de passe manquants");
//     } else {
//         const res = await auth.api.signInEmail({ body: { email, password } });
//         return res.user.id;
//     }
// }

// export async function signUp(data: RegisterFormValues) {
//     await auth.api.signUpEmail({
//         body: {
//             email: data.email,
//             password: data.password,
//             name: data.name,
//             // role: data.role,
//         },
//     });
// }

// export async function getUser() {
//     return await auth.api.getSession({
//         headers: await headers(),
//     });
// }

// export async function logOut() {
//     await auth.api.signOut({
//         headers: await headers(),
//     });
//     revalidatePath("/");
// }
