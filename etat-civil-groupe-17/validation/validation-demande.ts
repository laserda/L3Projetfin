import { TypeActe } from "@/lib/generated/prisma";
import { z } from "zod";

export const createDemandeSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
})
  
export type CreateDemandeFormData = z.infer<typeof createDemandeSchema>;
