"use server";

import { DemandeRepository } from './repositories/demandeRepository'
import { CitoyenRepository } from '../auth/repositories/citoyenRepository';
import {
    getSession,
} from "../sessions/citoyen_session";

import { createDemandeSchema } from '@/validation/validation-demande';
import { DemandePourTier, StatutDemande } from '@/lib/generated/prisma';
import { getDateTimeISOString } from '@/utils';
import { ErrorsMessage } from '@/enums/errors-message';
import { ResultData } from '@/types';

const demandeRepo = new DemandeRepository()
const citoyenRepo = new CitoyenRepository()

export async function createDemande(formData: FormData): Promise<ResultData> {
    const result = createDemandeSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            error: ErrorsMessage.errors,
        };
    }

    try {

        let session = await getSession();
        console.log(session);
        let user = await citoyenRepo.findById(session?.userId);
        if (!user) {
            return {
                error: ErrorsMessage.errors,
            };
        }

        if (result.data.DemandePourTier == DemandePourTier.Moi) {
            result.data.Nom = user.Nom;
            result.data.Prenom = user.Prenom;
            result.data.DateActe = user.DateNaissance.toISOString();
            // Réinitialiser les champs des parents pour une demande personnelle
            result.data.NomMere = '';
            result.data.PrenomMere = '';
            result.data.DateNaisMere = '';
            result.data.ProfessionMere = '';
            result.data.NomPere = '';
            result.data.PrenomPere = '';
            result.data.DateNaisPere = '';
            result.data.ProfessionPere = '';
        } else {
            // Formater les dates pour les demandes tier
            result.data.DateActe = `${result.data.DateActe}T00:00:00.000Z`;
            if (result.data.DateNaisMere) {
                result.data.DateNaisMere = `${result.data.DateNaisMere}T00:00:00.000Z`;
            }
            if (result.data.DateNaisPere) {
                result.data.DateNaisPere = `${result.data.DateNaisPere}T00:00:00.000Z`;
            }
        }

        // DateAct
        const newDemande = await demandeRepo.create({
            data: {
                ...result.data,
                Citoyen: {
                    connect: { ID_Citoyen: user.ID_Citoyen }
                },
                Statut: StatutDemande.SoumiseEnAttenteDePaiment,
                DateDemande: getDateTimeISOString(),
                DateActe: `${result.data.DateActe}`,
                DateNaisMere: result.data.DateNaisMere,
                DateNaisPere: result.data.DateNaisPere,
                ProfessionMere: result.data.ProfessionMere,
                ProfessionPere: result.data.ProfessionPere
            }
        });

        return {
            success: true,
            data: newDemande.ID_Demande,
        };
    } catch (error) {
        console.log(error);

        return {
            error: ErrorsMessage.errors,
        };
    }
}


export async function createPaimentDemande(paiement: any, ID_Demande: string) {

    try {

        let session = await getSession();
        console.log(session);
        let user = await citoyenRepo.findById(session?.userId);
        if (!user) {
            const err = new Error("Une erreur est survenue");
            return {
                succes: false,
                errors: err,
            };
        }

        console.log(paiement);
        const newDemande = await demandeRepo.update({
            where: { ID_Demande: ID_Demande },
            data: {
                Statut: StatutDemande.SoumisePayee,
                Paiement: {
                    create: {
                        ...paiement,
                        DatePaiement: getDateTimeISOString()
                    },
                },
            },
            include: {
                Paiement: true
            }

        });

        console.log(newDemande);

        return {
            success: true,
            ID_Demande: newDemande.ID_Demande,
        };
    } catch (error) {
        console.log(error)
        return {
            success: false,
            errors: [ErrorsMessage.errors],
        };
    }
}

export async function getDemande(ID_Demande: string) {
    return await demandeRepo.findOne({
        where: {
            ID_Demande: ID_Demande
        },
        include: {
            Citoyen: true
        }
    });
}

export async function getDemandePayer(ID_Demande: string) {
    return await demandeRepo.findOne({
        where: {
            ID_Demande: ID_Demande,
            Statut: { not: StatutDemande.SoumiseEnAttenteDePaiment }
        },
        include: {
            Citoyen: true
        }
    });
}

export async function getDemandeEnAttenteDePaiement(ID_Demande: string) {
    return await demandeRepo.findOne({
        where: {
            ID_Demande: ID_Demande,
            Statut: StatutDemande.SoumiseEnAttenteDePaiment
        },
        include: {
            Citoyen: true
        }
    });
}

export async function getSuivieDesDemande() {
    const session = await getSession();
    if (!session) {
        return {
            success: false,
            errors: [ErrorsMessage.errors],
        };
    }
    return await demandeRepo.findAll({
        include: {
            Citoyen: true
        },
        where: {
            ID_Citoyen: session?.userId
        }
    });
}
