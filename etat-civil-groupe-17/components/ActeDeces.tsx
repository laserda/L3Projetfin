"use client";
import { getActe } from "@/server/actes/actes";
import { dateEnLettres } from "@/utils";
import Image from "next/image";
import { forwardRef, useEffect, useState } from "react";


const ActeDeces = forwardRef<HTMLDivElement, { ID_Demande: string }>(
    function ActeDeces({ ID_Demande }, ref) {
        const [acteInfos, setActeInfos] = useState<any>(null);
        const [agent, setAgent] = useState<any>(null);
        const [isLoading, setIsLoading] = useState(true);

        const getDocumentInfo = async () => {
            try {
                const res = await getActe(ID_Demande);
                setActeInfos(res?.Demande);
                setAgent(res?.Agent)

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
            <div ref={ref} className="max-w-3xl h-screen mx-auto pt-10 p-10 border border-black text-sm leading-relaxed bg-white text-black font-serif">

                <div className=" flex justify-between p-8 mb-8 border-b-2 border-gray-800 pb-6">
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
                        <p className="uppercase font-bold text-lg mb-2">Acte de Décès</p>
                        <p className="text-lg">Du registre des actes de l'État Civil</p>
                        <p className="text-lg">Pour l'année {new Date(acteInfos?.DateActe || "").getFullYear()}
                        </p>
                    </div>
                </div>

                {/* Informations de l'état civil */}
                <div className="flex justify-between mb-4">
                    <div className="text-left">
                        <p className="uppercase font-bold text-md ">État civil</p>
                        <p className=" text-md">N° {acteInfos?.NumeroActe} du {new Date(acteInfos?.DateDemande || "").toLocaleDateString()} du registre</p>
                    </div>
                    <div className="text-center font-bold">
                        <p className="text-md mb-2">DÉCÈS DE</p>
                        <p className="text-lg mb-2">{acteInfos?.Nom}</p>
                        <p className="text-lg">{acteInfos?.Prenom}</p>
                    </div>
                </div>


                <div className="mb-8 text-md">
                    <p className="mb-1">
                        {acteInfos?.DateActe && <span>Le {dateEnLettres(acteInfos.DateActe)}</span>} ./
                        est décédé(e) <strong>{acteInfos?.Nom} {acteInfos?.Prenom}</strong>
                    </p>
                    <p className="mb-1">
                        fils de{" "} <strong>{acteInfos?.NomPere} {acteInfos?.PrenomPere}</strong>
                    </p>
                    <p className="mb-1">
                        Le père exerce la profession de <strong>{acteInfos?.ProfessionPere || "Sans profession"}</strong>
                    </p>
                    <p className="mb-1">
                        et de <strong>{acteInfos?.NomMere} {acteInfos?.PrenomMere}</strong>
                        profession{" "}<strong>{acteInfos?.ProfessionMere || "Sans profession"}</strong>
                    </p>
                </div>

                <div className="mb-4">
                    <p className="text-base text-center">
                        Certifié le présent acte de décès conforme aux indications portées au
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
                            Délivré  le <strong>{new Date(acteInfos?.DateDemande || "").toLocaleDateString()}</strong>
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

export { ActeDeces };

