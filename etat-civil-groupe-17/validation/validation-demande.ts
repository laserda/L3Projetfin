import { TypeActe } from "@/lib/generated/prisma";
import { DemandePourTier } from "@/utils";
import { z } from "zod";

// export enum DemandePourTier {
//   Moi = "Moi",
//   MonEnfant = "MonEnfant",
//   UnMenbreFamile = "UnMenbreFamile",
//   Autre = "Autre"
// }

export const naissanceSchema = z.object({
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



// export const naissanceSchema = z.object({
//     Nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
//     Prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
//     NomMere: z.string().min(2, 'Le nom de la mère doit contenir au moins 2 caractères').optional(),
//     PrenomMere: z.string().min(2, 'Le prénom de la mère doit contenir au moins 2 caractères').optional(),
//     ProfessionMere: z.string().max(100, 'La profession de la mère ne peut pas dépasser 100 caractères').optional(),
//     DateNaisMere: z.date().max(new Date(), 'La date de naissance de la mère ne peut pas être dans le futur').optional(),
//     NomPere: z.string().min(2, 'Le nom du père doit contenir au moins 2 caractères').optional(),
//     PrenomPere: z.string().min(2, 'Le prénom du père doit contenir au moins 2 caractères').optional(),
//     ProfessionPere: z.string().max(100, 'La profession du père ne peut pas dépasser 100 caractères').optional(),
//     DateNaisPere: z.date().max(new Date(), 'La date de naissance du père ne peut pas être dans le futur').optional(),
// });

// export type DemandeNaissanceFormData = z.infer<typeof naissanceSchema>;

export enum QuiDemande {
    LeMari = "Le mari",
    LaFemme = "La femme",
    Autre = "Autre"
}

export const mariageSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
    NumeroActe: z.string(),
    DemandePourTier: z.nativeEnum(QuiDemande).optional(),
    DateActe: z.string().min(1, "La date de l'acte est requis"),
    NomEpoux: z.string()
        .min(2, 'Le nom de l\'époux doit contenir au moins 2 caractères')
        .optional(),
    PrenomEpoux: z.string()
        .min(2, 'Le prénom de l\'époux doit contenir au moins 2 caractères').optional(),
    DateNaissanceEpoux: z.string()
        .min(1, 'La date de naissance de l\'époux ne peut pas être dans le futur').optional(),
    NomEpouse: z.string()
        .min(2, 'Le nom de l\'épouse doit contenir au moins 2 caractères')
        .max(50, 'Le nom de l\'épouse ne peut pas dépasser 50 caractères')
        .optional(),
    PrenomEpouse: z.string()
        .min(2, 'Le prénom de l\'épouse doit contenir au moins 2 caractères')
        .optional(),
    DateNaissanceEpouse: z.string()
        .min(1, 'La date de naissance de l\'épouse ne peut pas être dans le futur').optional(),
});

export type DemandeMariageFormData = z.infer<typeof mariageSchema>;


export const decesSchema = z.object({
    TypeActe: z.nativeEnum(TypeActe),
    NumeroActe: z.string(),
    DateActe: z.string().min(1, "La date de l'acte est requis"),
    Nom: z.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères'),
    Prenom: z.string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    NomMere: z.string()
        .min(2, 'Le nom de la mère doit contenir au moins 2 caractères')
        .optional(),
    PrenomMere: z.string()
        .min(2, 'Le prénom de la mère doit contenir au moins 2 caractères')
        .optional(),
    ProfessionMere: z.string()
        .max(100, 'La profession de la mère ne peut pas dépasser 100 caractères')
        .optional(),
    NomPere: z.string()
        .min(2, 'Le nom du père doit contenir au moins 2 caractères')
        .optional(),
    PrenomPere: z.string()
        .min(2, 'Le prénom du père doit contenir au moins 2 caractères')
        .optional(),
    ProfessionPere: z.string()
        .max(100, 'La profession du père ne peut pas dépasser 100 caractères')
        .optional(),
});

export type DemandeDecesFormData = z.infer<typeof decesSchema>;


export type DemandeNaissanceFormData = z.infer<typeof naissanceSchema>;
export type CreateDemandeDecesFormData = z.infer<typeof createDemandeDecesSchema>;
export type CreateDemandeMariageFormData = z.infer<typeof createDemandeMariageSchema>;
