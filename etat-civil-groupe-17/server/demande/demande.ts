"use server";

import { DemandeRepository } from './repositories/demandeRepository'
import { CitoyenRepository } from '../auth/repositories/citoyenRepository';
import {
    createSession,
    deleteSession,
    getSession,
} from "../sessions/agent_session";
import { redirect } from "next/navigation";

import { createDemandeSchema } from '@/validation/validation-demande';
import { hashPassword, verifyPassword } from "@/lib/hashPassword";
<<<<<<< HEAD
import { DemandePourTier, StatutDemande } from '@/lib/generated/prisma';
import { getDateTimeISOString } from '@/utils';
=======
import { StatutDemande } from '@/lib/generated/prisma';
>>>>>>> 01d5ee7d8070ca0275bb4b8ecaa267485d1ecb35

const demandeRepo = new DemandeRepository()
const citoyenRepo = new CitoyenRepository()


export async function createDemande(formData: FormData) {
    const result = createDemandeSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
            succes: false,
        };
    }

    try {

        let session = await getSession();        
        console.log(session);
        let user = await citoyenRepo.findById(session?.userId);
        if(!user){
            const err = new Error("Une erreur est survenue");
            return {
                succes: false,
                errors: err,
            };
        }

        console.log(result.data);
<<<<<<< HEAD
        

        // if(result.data.DemandePourTier == DemandePourTier.Moi){
        //     result.data.Nom = user.Nom;
        //     result.data.Prenom = user.Prenom;
        //     result.data.DateActe = user.DateActe;
        // }

=======
        // DateAct
>>>>>>> 01d5ee7d8070ca0275bb4b8ecaa267485d1ecb35
        const newDemande = await demandeRepo.create({
            data: {
                ...result.data,
                citoyen: {
                    connect: { ID_Citoyen: user.ID_Citoyen }
                },
                Statut: StatutDemande.SoumiseEnAttenteDePaiment,
<<<<<<< HEAD
                DateDemande: getDateTimeISOString(),
=======
                DateDemande: new Date("1993-01-01T00:00:00.000Z"),
>>>>>>> 01d5ee7d8070ca0275bb4b8ecaa267485d1ecb35
                DateActe:result.data.DateActe.length == 0 ? '' : `${result.data.DateActe}T00:00:00.000Z`,
            }
        });
        
        console.log(newDemande);

        return {
            succes: true,
            ID_Demande: newDemande.ID_Demande,
        };
    } catch (error) {
        console.log(error)
        return {
            succes: false,
            errors: error,
        };
    }
}
