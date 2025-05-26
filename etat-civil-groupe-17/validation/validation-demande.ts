import { DemandePourTier, TypeActe } from "@/lib/generated/prisma";
import { z } from "zod";

export const createDemandeSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
    NumeroActe: z.string(),
    DemandePourTier: z.nativeEnum(DemandePourTier),
    Prenom: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    Nom: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    DateActe: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : `${val}`;
    }),
    PrenomMere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    NomMere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    DateNaisMere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : `${val}`;
    }),
    PrenomPere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    NomPere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    DateNaisPere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : `${val}`;
    }),
    ProfessionPere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    }),
    ProfessionMere: z.string().optional().transform((val, ctx: any) => {
        const demandePourTier = ctx.contextualData?.DemandePourTier;
        return demandePourTier === DemandePourTier.Moi ? '' : val;
    })
})

export const createDemandeMariageSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
    NumeroActe: z.string().min(1, "Le numéro de l'acte est requis"),
    DateActe: z.string().min(1, "La date de l'acte est requise"),
    // Premier conjoint
    Nom: z.string().min(1, "Le nom est requis"),
    Prenom: z.string().min(1, "Le prénom est requis"),
    DateNaisPere: z.string().min(1, "La date de naissance est requise"),
    ProfessionPere: z.string().optional(),
    // Second conjoint
    NomMere: z.string().min(1, "Le nom est requis"),
    PrenomMere: z.string().min(1, "Le prénom est requis"),
    DateNaisMere: z.string().min(1, "La date de naissance est requise"),
    ProfessionMere: z.string().optional(),

    DemandePourTier: z.nativeEnum(DemandePourTier).optional().transform(() => DemandePourTier.Autre)
})

export const createDemandeDecesSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
    NumeroActe: z.string().min(1, "Le numéro de l'acte est requis"),
    DateActe: z.string().min(1, "La date de l'acte est requise"),
    // Premier du défunt
    Nom: z.string().min(1, "Le nom du défunt est requis"),
    Prenom: z.string().min(1, "Le prénom du défunt est requis"),
    DemandePourTier: z.nativeEnum(DemandePourTier).optional().transform(() => DemandePourTier.Autre),


    NomPere: z.string().min(1, "Le nom est requis"),
    PrenomPere: z.string().min(1, "Le prénom est requis"),
    ProfessionPere: z.string().optional(),
    DateNaisPere: z.string().optional().transform(() => new Date().toISOString().split('T')[0]),

    NomMere: z.string().min(1, "Le nom est requis"),
    PrenomMere: z.string().min(1, "Le prénom est requis"),
    DateNaisMere: z.string().optional().transform(() => new Date().toISOString().split('T')[0]),
    ProfessionMere: z.string().optional()
})

export type CreateDemandeFormData = z.infer<typeof createDemandeSchema>;
export type CreateDemandeDecesFormData = z.infer<typeof createDemandeDecesSchema>;
export type CreateDemandeMariageFormData = z.infer<typeof createDemandeMariageSchema>;
