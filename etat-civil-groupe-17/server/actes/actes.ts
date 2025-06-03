"use server";

import { ActeRepository } from './repositories/actesRepository'
import { getSession } from "../sessions/citoyen_session";
import { getDateTimeISOString } from '@/utils';
import { ErrorsMessage } from '@/enums/errors-message';
import { ResultData } from '@/types';
import { AgentRepository } from '../auth/repositories/agentRepository';

import { TypeActe } from '@/lib/generated/prisma';


const acteRepo = new ActeRepository()
const agentRepo = new AgentRepository()

export async function createActe(ID_Demande: string): Promise<ResultData> {
    // const result = createDemandeSchema.safeParse(Object.fromEntries(formData));

    if (!ID_Demande || ID_Demande.length === 0 || typeof ID_Demande !== 'string') {
        return { error: ErrorsMessage.errors };
    }

    try {
        const session = await getSession();
        const user = await agentRepo.findById(session?.userId);

        if (!user) {
            return { error: ErrorsMessage.errors };
        }

        const newDemande = await acteRepo.create({
            data: {
                DateDelivrance: getDateTimeISOString(),
                Fichier_PDF: "",
                SignatureNumerique: "Signée",
                EstArchive: false,
                DateArchivage: new Date(),
                Demande: {
                    connect: {
                        ID_Demande: ID_Demande
                    }
                },
                Agent: {
                    connect: {
                        ID_Agent: user.ID_Agent
                    }
                }
            }
        });

        return {
            success: true,
            data: newDemande.SignatureNumerique,
        };
    } catch (error) {
        console.error('Erreur lors de la création de la demande:', error);
        return { error: ErrorsMessage.errors };
    }
}

export async function getActe(ID_Demande: string) {

    try {
        const acte = await acteRepo.findOne({
            where: { ID_Demande },
            include: {
                Agent: true,
                Demande: {
                    include: {
                        Citoyen: true,
                        Deces: true,
                        Mariages: true,
                        Naissances: true
                    }
                }
            }
        });
        const res = factoryActe(acte);
        return res;

    } catch (error) {
        console.error("Erreur lors de la récupération de l'acte:", error);
        return null;
    }
}

function factoryActe(data: any) {
    switch (data.Demande.TypeActe) {
        case TypeActe.Naissance:
            const naissance = {
                Citoyen: {
                    Nom: data.Demande.Citoyen.Nom,
                    Prenom: data.Demande.Citoyen.Prenom,
                    Email: data.Demande.Citoyen.Email,
                },
                Demande: {
                    ...data.Demande,
                    Nom: data.Demande.Naissances.Nom,
                    Prenom: data.Demande.Naissances.Prenom,
                    NomMere: data.Demande.Naissances.NomMere,
                    PrenomMere: data.Demande.Naissances.PrenomMere,
                    ProfessionMere: data.Demande.Naissances.ProfessionMere,
                    DateNaisMere: data.Demande.Naissances.DateNaisMere,
                    NomPere: data.Demande.Naissances.NomPere,
                    PrenomPere: data.Demande.Naissances.PrenomPere,
                    ProfessionPere: data.Demande.Naissances.ProfessionPere,
                    DateNaisPere: data.Demande.Naissances.DateNaisPere
                },
                Agent: {
                    Nom: data.Agent.Nom,
                    Prenom: data.Agent.Prenom,
                    // Email: data.Demande.Citoyen.Email,
                },
            }
            return naissance
        case TypeActe.Mariage:
            const mariage = {
                Citoyen: data.Demande.Citoyen,
                Demande: {
                    ...data.Demande,
                    Nom: data.Demande.Mariages.Nom,
                    Prenom: data.Demande.Mariages.Prenom,
                    NomMere: data.Demande.Mariages.NomMere,
                    PrenomMere: data.Demande.Mariages.PrenomMere,
                    ProfessionMere: data.Demande.Mariages.ProfessionMere,
                    DateNaisMere: data.Demande.Mariages.DateNaisMere,
                    NomPere: data.Demande.Mariages.NomPere,
                    PrenomPere: data.Demande.Mariages.PrenomPere,
                    ProfessionPere: data.Demande.Mariages.ProfessionPere,
                    DateNaisPere: data.Demande.Mariages.DateNaisPere
                },
                Agent: {
                    Nom: data.Agent.Nom,
                    Prenom: data.Agent.Prenom,
                    // Email: data.Demande.Citoyen.Email,
                },
            }
            return mariage
        case TypeActe.Décès:
            const deces = {
                Citoyen: data.Demande.Citoyen,
                Demande: {
                    ...data.Demande,
                    Nom: data.Demande.Deces.Nom,
                    Prenom: data.Demande.Deces.Prenom,
                    NomMere: data.Demande.Deces.NomMere,
                    PrenomMere: data.Demande.Deces.PrenomMere,
                    ProfessionMere: data.Demande.Deces.ProfessionMere,
                    DateNaisMere: data.Demande.Deces.DateNaisMere,
                    NomPere: data.Demande.Deces.NomPere,
                    PrenomPere: data.Demande.Deces.PrenomPere,
                    ProfessionPere: data.Demande.Deces.ProfessionPere,
                    DateNaisPere: data.Demande.Deces.DateNaisPere
                },
                Agent: {
                    Nom: data.Agent.Nom,
                    Prenom: data.Agent.Prenom,
                    // Email: data.Demande.Citoyen.Email,
                },
            }
            return deces
        default:
            return null;
    }
}

// export async function archiverActe(ID_Document_Acte: string) {
//     try {
//         const acteArchive = await acteRepo.update({
//             where: { ID_Document_Acte },
//             data: {
//                 EstArchive: true,
//                 DateArchivage: getDateTimeISOString()
//             }
//         });

//         return {
//             success: true,
//             data: acteArchive
//         };
//     } catch (error) {
//         console.error('Erreur lors de l\'archivage de l\'acte:', error);
//         return { error: ErrorsMessage.errors };
//     }
// }

// export async function getActesArchives() {
//     try {
//         return await acteRepo.findAll({
//             where: { EstArchive: true },
//             include: {
//                 Agent: true,
//                 Demande: {
//                     include: {
//                         Citoyen: true
//                     }
//                 }
//             }
//         });
//     } catch (error) {
//         console.error('Erreur lors de la récupération des actes archivés:', error);
//         return [];
//     }
// }