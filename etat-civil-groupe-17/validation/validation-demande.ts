import { TypeActe } from "@/lib/generated/prisma";
import { z } from "zod";

export const createDemandeSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
    NumeroActe: z.string()
})
  
export type CreateDemandeFormData = z.infer<typeof createDemandeSchema>;
