"use server";

import { DemandeRepository } from './repositories/demandeRepository'
import { NaissanceRepository } from './repositories/naissanceRepository';
import { MarigeRepository } from './repositories/mariageRepository';
import { DecesRepository } from './repositories/decesRepository';
import { CitoyenRepository } from '../auth/repositories/citoyenRepository';
import {
    getSession,
} from "../sessions/citoyen_session";

import { naissanceSchema, decesSchema, mariageSchema, DemandeDecesFormData, QuiDemande } from '@/validation/validation-demande';
import { Deces, Demande, DemandePourTier, Naissance, StatutDemande, TypeActe, } from '@/lib/generated/prisma';
import { getDateTimeISOString } from '@/utils';
import { ErrorsMessage } from '@/enums/errors-message';
import { ResultData } from '@/types';

const naissanceRepo = new NaissanceRepository()
const mariageRepo = new MarigeRepository()
const decesRepo = new DecesRepository()
const demandeRepo = new DemandeRepository()
const citoyenRepo = new CitoyenRepository()

export async function createDemande(formData: FormData): Promise<ResultData> {
    const result = naissanceSchema.safeParse(Object.fromEntries(formData));

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
            // // Réinitialiser les champs des parents pour une demande personnelle
            // result.data.NomMere = '';
            // result.data.PrenomMere = '';
            // result.data.DateNaisMere = '';
            // result.data.ProfessionMere = '';
            // result.data.NomPere = '';
            // result.data.PrenomPere = '';
            // result.data.DateNaisPere = '';
            // result.data.ProfessionPere = '';
        } else {
            // Formater les dates pour les demandes tier
            result.data.DateActe = `${result.data.DateActe}T00:00:00.000Z`;
        }


        if (result.data.DateNaisMere) {
            result.data.DateNaisMere = `${result.data.DateNaisMere}T00:00:00.000Z`;
        }
        if (result.data.DateNaisPere) {
            result.data.DateNaisPere = `${result.data.DateNaisPere}T00:00:00.000Z`;
        }

        const demande = {
            DemandePourTier: result.data.DemandePourTier,
            Statut: StatutDemande.SoumiseEnAttenteDePaiment,
            TypeActe: result.data.TypeActe,
            NumeroActe: result.data.NumeroActe
        }

        // DateAct
        const newDemande = await demandeRepo.create({
            data: {
                ...demande,
                Citoyen: {
                    connect: { ID_Citoyen: user.ID_Citoyen }
                },
                DateDemande: getDateTimeISOString(),
                DateActe: `${result.data.DateActe}`
            }
        });

        const demandeNaissance = {
            Nom: result.data.Nom ?? '',
            Prenom: result.data.Prenom ?? '',
            NomMere: result.data.NomMere ?? '',
            PrenomMere: result.data.PrenomMere ?? '',
            ProfessionMere: result.data.ProfessionMere ?? '',
            NomPere: result.data.NomPere ?? '',
            PrenomPere: result.data.PrenomPere ?? '',
            ProfessionPere: result.data.ProfessionPere ?? ''
        }

        const newDemandeNaissance = await naissanceRepo.create({
            data: {
                ...demandeNaissance,
                ID_Demande: newDemande.ID_Demande,
                DateNaisMere: `${result.data.DateNaisMere}`,
                DateNaisPere: `${result.data.DateNaisPere}`
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

export async function createMarigeDemande(formData: FormData): Promise<ResultData> {
    const result = mariageSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            error: ErrorsMessage.errors,
        };
    }

    try {
        let session = await getSession();
        let user = await citoyenRepo.findById(session?.userId);
        if (!user) {
            return {
                error: ErrorsMessage.errors,
            };
        }
        console.log('user', user);

        if (result.data.DemandePourTier === QuiDemande.LeMari) {
            result.data.NomEpoux = user.Nom;
            result.data.PrenomEpoux = user.Prenom;
            result.data.DateNaissanceEpoux = user.DateNaissance.toISOString();
            result.data.DateNaissanceEpouse = user.DateNaissance.toISOString();
        } if (result.data.DemandePourTier === QuiDemande.LaFemme) {
            result.data.NomEpouse = user.Nom;
            result.data.PrenomEpouse = user.Prenom;
            result.data.DateNaissanceEpoux = user.DateNaissance.toISOString();
            result.data.DateNaissanceEpouse = user.DateNaissance.toISOString();
        } if (result.data.DemandePourTier === QuiDemande.Autre) {
            result.data.DateNaissanceEpoux = `${result.data.DateNaissanceEpoux}T00:00:00.000Z`;
            result.data.DateNaissanceEpouse = `${result.data.DateNaissanceEpouse}T00:00:00.000Z`;
        }

        const demande = {
            DemandePourTier: result.data.DemandePourTier,
            Statut: StatutDemande.SoumiseEnAttenteDePaiment,
            TypeActe: result.data.TypeActe,
            NumeroActe: result.data.NumeroActe
        }
        console.log('data', result.data);
        const newDemande = await demandeRepo.create({
            data: {
                ...demande,
                Citoyen: {
                    connect: { ID_Citoyen: user.ID_Citoyen }
                },
                DateDemande: getDateTimeISOString(),
                DateActe: `${result.data.DateActe}T00:00:00.000Z`
            }
        });

        // const newDateNaissanceEpouse = `${result.data.DateNaissanceEpouse}T00:00:00.000Z`


        const demandeMariage = {
            NomEpoux: result.data.NomEpoux ?? '',
            PrenomEpoux: result.data.PrenomEpoux ?? '',
            DateNaissanceEpoux: result.data.DateNaissanceEpoux ?? '',
            NomEpouse: result.data.NomEpouse ?? '',
            PrenomEpouse: result.data.PrenomEpouse ?? '',
            DateNaissanceEpouse: result.data.DateNaissanceEpouse ?? ''
        }

        const newDemandeMariage = await mariageRepo.create({
            data: {
                ...demandeMariage,
                ID_Demande: newDemande.ID_Demande
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

export async function createDecesDemande(formData: FormData): Promise<ResultData> {
    const result = decesSchema.safeParse(Object.fromEntries(formData));

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

        const demande = {
            Statut: StatutDemande.SoumiseEnAttenteDePaiment,
            TypeActe: TypeActe.Décès,
            NumeroActe: result.data.NumeroActe,
            DateActe: `${result.data.DateActe}T00:00:00.000Z`
        }
        console.log(result.data);


        // DateAct
        const newDemande = await demandeRepo.create({
            data: {
                ...demande,
                Citoyen: {
                    connect: { ID_Citoyen: user.ID_Citoyen }
                },
                DateDemande: getDateTimeISOString(),
                DateActe: `${result.data.DateActe}T00:00:00.000Z`,
                DemandePourTier: 'Autre'
            }
        });

        const demandeDeces = {
            Nom: result.data.Nom ?? '',
            Prenom: result.data.Prenom ?? '',
            NomMere: result.data.NomMere ?? '',
            PrenomMere: result.data.PrenomMere ?? '',
            ProfessionMere: result.data.ProfessionMere ?? '',
            NomPere: result.data.NomPere ?? '',
            PrenomPere: result.data.PrenomPere ?? '',
        }

        const newDemandeDeces = await decesRepo.create({
            data: {
                ...demandeDeces,
                ID_Demande: newDemande.ID_Demande,
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

function factoryDemande(data: any) {
    switch (data.TypeActe) {
        case TypeActe.Naissance:
            const naissance = {
                Demande: {
                    ...data,
                    Nom: data.Citoyen.Nom,
                    Prenom: data.Citoyen.Prenom,
                    Email: data.Citoyen.Email,
                },
            }
            return naissance
        case TypeActe.Mariage:
            const mariage = {
                Demande: {
                    ...data,
                    Nom: data.Citoyen.Nom,
                    Prenom: data.Citoyen.Prenom,
                    Email: data.Citoyen.Email,
                },
            }
            return mariage
        case TypeActe.Décès:
            const deces = {
                Demande: {
                    ...data,
                    Nom: data.Citoyen.Nom,
                    Prenom: data.Citoyen.Prenom,
                    Email: data.Citoyen.Email,
                },
            }
            return deces
        default:
            return null;
    }
}

export async function getDemandePayer(ID_Demande: string) {

    const demande = await demandeRepo.findOne({
        where: {
            ID_Demande: ID_Demande,
            Statut: { not: StatutDemande.SoumiseEnAttenteDePaiment }
        },
        include: {
            Citoyen: true,
            Naissances: true,
            Mariages: true,
            Deces: true
        }
    });

    return factoryDemande(demande);
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


