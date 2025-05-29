"use client";
import { getActe } from "@/server/actes/actes";
import { dateEnLettres } from "@/utils";
import Image from "next/image";
import { forwardRef, useEffect, useState } from "react";


const ActeMariage = forwardRef<HTMLDivElement, { ID_Demande: string }>(
    function ActeMariage({ ID_Demande }, ref) {
        const [acteInfos, setActeInfos] = useState<any>(null);
        const [agent, setAgent] = useState<any>(null);
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
            <div ref={ref} className="max-w-4xl mx-auto p-12 border-2 border-gray-800 text-sm leading-relaxed bg-white text-black font-serif shadow-md">
                {/* En-tête avec le logo et le titre */}
                <div className="flex justify-between mb-8 border-b-2 border-gray-800 pb-6">
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
                        <p className="uppercase font-bold text-lg mb-2">Acte de Mariage</p>
                        <p className="text-md">Du registre des actes de l'État Civil</p>
                        <p className="text-md">Pour l'année {new Date(acteInfos?.DateActe || "").getFullYear()}</p>
                    </div>
                </div>

                {/* Informations de l'état civil */}
                <div className="flex justify-between">
                    <div className="text-left">
                        <p className="uppercase font-bold text-md">État civil</p>
                        <p className="text-base">N° {acteInfos?.NumeroActe} du {new Date(acteInfos?.DateDemande || "").toLocaleDateString()} du registre</p>
                    </div>
                    <div className="text-center font-bold">
                        <p className="text-md mb-2">MARIAGE DE</p>
                        <p>
                            <span> {acteInfos?.Nom} {acteInfos?.Prenom} </span>
                            et de
                            <span> {acteInfos?.NomMere} {acteInfos?.PrenomMere} </span>
                        </p>
                    </div>
                </div>

                {/* Informations du mariage */}
                <div className="mb-8 text-md">
                    <p className="mb-1 text-center">
                        {acteInfos?.DateActe && <span>Le {dateEnLettres(acteInfos.DateActe)}</span>} ./
                        ont été unis par les liens du mariage
                    </p>
                    <div className="flex justify-between mb-4">
                        {/* Informations du premier conjoint */}
                        <div className="mb-4">
                            <p className="mb-1">
                                <strong>Premier conjoint :</strong>
                            </p>
                            <p className="mb-1">
                                {acteInfos?.Prenom} {acteInfos?.Nom}
                            </p>
                            <p className="mb-1">
                                Né(e) le {new Date(acteInfos?.DateActe || "").toLocaleDateString()}</p>
                            <p className="mb-1">
                                Profession : {acteInfos?.ProfessionPere || "Sans profession"}
                            </p>
                            <p className="mb-1">
                                Fils/fille de {acteInfos?.NomPere} {acteInfos?.PrenomPere} et de {acteInfos?.NomMere} {acteInfos?.PrenomMere}
                            </p>
                        </div>

                        {/* Informations du second conjoint */}
                        <div className="mb-4">
                            <p className="mb-1">
                                <strong>Second conjoint :</strong>
                            </p>
                            <p className="mb-1">
                                {acteInfos?.PrenomMere} {acteInfos?.NomMere}
                            </p>
                            <p className="mb-1">
                            </p>
                            <p className="mb-1">
                                Profession : {acteInfos?.ProfessionMere || "Sans profession"}
                            </p>
                            <p className="mb-1">
                                Fils/fille de {acteInfos?.NomPere} {acteInfos?.PrenomPere} et de {acteInfos?.NomMere} {acteInfos?.PrenomMere}
                            </p>
                        </div>

                    </div>

                </div>

                {/* Mentions */}
                <div className="border-t-2 border-b-2 border-gray-800 py-6 mb-4">
                    <div className="text-center font-bold text-md mb-4">MENTIONS MARGINALES</div>
                    <div className="space-y-3 text-base">
                        <p>Divorce prononcé le ....................................... Néant .......................... à ................. Néant ......................</p>
                        <p>par jugement du tribunal de ..................................... Néant .......................................................</p>
                        <p>Décès d'un des conjoints le ............... Néant .......... à ... Néant ...</p>
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

                        <p className="font-semibold text-md mb-2">L'Officier de l'État Civil,</p>
                        <div className="mb-4">
                            <Image
                                src="/signature1.png"
                                alt="signature"
                                width={150}
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

export { ActeMariage };
