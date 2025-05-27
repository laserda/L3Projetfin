"use client";
import { Agent, Demande, Citoyen } from "@/lib/generated/prisma";
import { getActe } from "@/server/actes/actes";
import { dateEnLettres } from "@/utils";
import Image from "next/image";
import { forwardRef, useEffect, useState } from "react";



const ActeNaissance = forwardRef<HTMLDivElement, { ID_Demande: string }>(
    function ActeNaissance({ ID_Demande }, ref) {
        const [acteInfos, setActeInfos] = useState<any>(null);
        const [agent, setAgent] = useState<Agent | null>(null);
        const [isLoading, setIsLoading] = useState(true);

        const getDocumentInfo = async () => {
            try {
                const res = await getActe(ID_Demande);
                setActeInfos(res?.Demande);
                setAgent(res?.Agent);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        useEffect(() => {
            getDocumentInfo();
        }, [ID_Demande]);

        if (isLoading) {
            return null;
        }

        return (
            <div ref={ref} className="max-w-4xl mx-auto p-12 border-2 border-gray-800 text-sm leading-relaxed bg-white text-black font-serif shadow-lg">
                {/* En-tête avec le logo et le titre */}
                <div className=" flex justify-between mb-8 border-b-2 border-gray-800 pb-6">
                    <div className="flex flex-col items-center">
                        <p className="uppercase font-bold mb-2 text-sm">République de Côte d'Ivoire</p>
                        <Image
                            src="/logoCI.png"
                            alt="Logo Côte d'Ivoire"
                            width={100}
                            height={50}
                            priority
                            className="object-cover"
                        />
                        <p className="font-semibold mt-2 text-sm">Union - Discipline - Travail</p>
                    </div>
                    <div className="text-center">
                        <p className="uppercase font-bold text-lg mb-2">Extrait</p>
                        <p className="text-lg">Du registre des actes de l'État Civil</p>
                        <p className="text-lg">Pour l'année {new Date(acteInfos?.DateActe || "").getFullYear()}</p>
                    </div>
                </div>

                {/* Informations de l'état civil */}
                <div className="flex justify-between mb-4">
                    <div className="text-left">
                        {/* <p className="uppercase font-bold text-md">Département de {acteInfos?.Citoyen.LieuNaissance}</p> */}
                        {/* <p className="text-md">Commune de {acteInfos?.Citoyen.LieuNaissance}</p> */}
                        <p className="uppercase font-bold text-md ">État civil</p>
                        {/* <p className="text-md">Centre principal {acteInfos?.Citoyen.LieuNaissance}</p> */}
                        <p className=" text-md">N° {acteInfos?.NumeroActe} du {new Date(acteInfos?.DateDemande || "").toLocaleDateString()} du registre</p>
                    </div>
                    <div className="text-center font-bold">
                        <p className="text-md mb-2">NAISSANCE DE</p>
                        <p className="text-lg mb-2">{acteInfos?.Nom}</p>
                        <p className="text-lg">{acteInfos?.Prenom}</p>
                    </div>
                </div>

                {/* Informations de naissance */}
                <div className="mb-8 text-md">
                    <p className="mb-1">
                        {acteInfos?.DateActe && <span>Le {dateEnLettres(acteInfos.DateActe)}</span>} ./
                        à vingt heures zéro minute ./
                        est né <strong>{acteInfos?.Prenom}</strong>
                    </p>
                    <p className="mb-1">
                        {/* à la Maternité de {acteInfos?.Citoyen.LieuNaissance} ./ */}
                        fils de{" "} <strong>{acteInfos?.NomPere} {acteInfos?.PrenomPere}</strong>
                    </p>
                    <p className="mb-1">
                        et de <strong>{acteInfos?.NomMere} {acteInfos?.PrenomMere}</strong>
                        profession{" "}<strong>{acteInfos?.ProfessionMere || "Sans profession"}</strong>
                    </p>
                    <p className="mb-1">
                        Le père exerce la profession de <strong>{acteInfos?.ProfessionPere || "Sans profession"}</strong>
                    </p>
                </div>

                {/* Mentions */}
                <div className="border-t-2 border-b-2 border-gray-800 py-6 mb-4">
                    <div className="text-center font-bold text-lg mb-4">MENTIONS (éventuellement)</div>
                    <div className="space-y-3 text-base">
                        <p>Marié le ..................................................... Néant ............................. à ................. Néant ......................</p>
                        <p>avec ..................................... Néant .......................................................</p>
                        <p>Mariage dissous par décision de divorce en date du .................................. Néant ...............................</p>
                        <p>Décédé le ............... Néant .......... à ... Néant ...</p>
                    </div>
                </div>

                {/* Certification */}
                <div className="mb-4">
                    <p className="text-base">
                        Certifié le présent extrait conforme aux indications portées au
                        registre.
                    </p>
                </div>

                {/* Signature et date */}
                <div className="flex justify-between items-start">
                    <div className="text-center">
                        <div className="w-32 h-24 border-2 border-gray-800 flex items-center justify-center">
                            <p className="font-bold">Timbre</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-lg mb-4">
                            {/* Délivré à {acteInfos?.Citoyen.LieuNaissance} */}
                            , le <strong>{new Date(acteInfos?.DateDemande || "").toLocaleDateString()}</strong>
                        </p>
                        <p className="font-semibold text-md mb-2">L'Officier de l'État Civil,</p>
                        <div className="mb-4">
                            <Image
                                src="/signature1.png"
                                alt="signature"
                                width={200}
                                height={70}
                                priority
                                className="object-contain"
                            />
                        </div>
                        <p className="italic text-base font-semibold">{agent?.Nom} {agent?.Prenom}</p>
                    </div>
                </div>
            </div>
        );
    }
);

export { ActeNaissance };