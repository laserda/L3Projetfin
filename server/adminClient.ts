// // "use server";
// import { authClient } from "@/lib/auth-client";
// // import { revalidatePath } from "next/cache";

// export async function createAgent(formData: any) {
//     try {
//         const { data, error } = await authClient.admin.createUser(
//             {
//                 email: formData.email,
//                 password: formData.password,
//                 name: formData.name,
//                 role: [],
//             },
//         );
//         console.log(data);

//         return { user: data?.user, error: error };
//     } catch (error) {
//         return { error, user: null };
//     }
// }
