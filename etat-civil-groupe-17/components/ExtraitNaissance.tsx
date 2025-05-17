import { Agent, Demande } from "@/lib/generated/prisma";
import { getAgent } from "@/server/auth/agent";

// app/components/ExtraitNaissance.tsx
export function ExtraitNaissance({ ref, infos, currentAgent }: { ref: any, infos: Demande, currentAgent: Agent }) {

    return (
        <div ref={ref} className="max-w-3xl h-screen mx-auto p-10 border border-black text-sm leading-relaxed bg-white text-black font-serif">
            <div className="text-center mb-4">
                <p className="uppercase font-bold">République de Côte d'Ivoire</p>
                <p className="font-semibold">------</p>
                <p className="uppercase font-bold">Extrait</p>
                <p>Du registre des actes de l'État Civil</p>
                <p>Pour l'année {infos?.DateActe?.toLocaleDateString()}</p>
            </div>

            <div className="flex justify-between mb-6">
                <div className="text-left">
                    {/* <p className="uppercase font-bold">Département de {infos.Citoyen.LieuNaissance}</p>
                    <p>Commune de {infos.Citoyen.LieuNaissance}</p>
                    <p className="uppercase font-bold">État civil</p>
                    <p>Centre principal {infos.Citoyen.LieuNaissance}</p> */}
                    <p className="mt-2">N° {infos.NumeroActe} du {infos.DateDemande?.toLocaleDateString()} du registre</p>
                </div>
                <div className="text-right font-bold">
                    <p>NAISSANCE DE</p>
                    <p className="text-lg">{infos.Nom}</p>
                    <p>{infos.Prenom} .</p>
                </div>
            </div>

            <div className="mb-6">
                <p>
                    Le premier août mil neuf cent quatre-vingt-dix-huit ./ à vingt heures
                    zéro minute ./ est né <strong>{infos.Prenom} ./</strong>
                </p>
                <p>
                    {/* à la Maternité de {infos.Citoyen.LieuNaissance} ./ fils de{" "}
                    <strong>{infos.Citoyen.Nom} ./</strong> profession{" "}
                    <strong>{infos.Citoyen.Profession} ./</strong> */}

                </p>
                <p>
                    et de <strong>Nom de la Mere ./</strong> profession{" "}
                    <strong>Sans ./</strong>
                </p>
            </div>

            <hr className="my-4 border-t border-black" />
            <div className="text-center font-bold">MENTIONS (éventuellement)</div>
            <div className="mt-2 space-y-1">
                <p>Marié le ..................................................... Néant ............................. à ................. Néant ......................</p>
                <p>avec ..................................... Néant .......................................................</p>
                <p>
                    Mariage dissous par décision de divorce en date du ..................................... Néant ..................................
                </p>
                <p>Décédé le ............... Néant .......... à ... Néant ...</p>
            </div>

            <div className="mt-6 text-sm">
                <p>
                    Certifié le présent extrait conforme aux indications portées au
                    registre.
                </p>
                <p className="mt-2">
                    {/* Délivré à {infos.Citoyen.LieuNaissance}, le <strong>{infos.DateDemande?.toLocaleDateString()}</strong> */}
                </p>
                <p className="mt-4 font-semibold">L'Officier de l'État Civil,</p>
                <p className="italic">{currentAgent.Nom} {currentAgent.Prenom}</p>

            </div>

        </div>
    );
}
