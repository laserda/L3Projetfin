"use client";
import { Suspense } from "react";

import { LoaderCircle } from "lucide-react";
import DemandeForm from "./demande-form";
import { useSearchParams } from "next/navigation";
import { TypeActe } from "@/lib/generated/prisma";
import DemandeNaissanceForm from "./demande-naissance-form";
import DemandeMariageForm from "./demande-mariage-form";
import DemandeDecesForm from "./demande-deces-form";

const DemandePage = () => {
    const searchParams = useSearchParams();

    const typeFromUrl = searchParams.get("type") as TypeActe;

    return (
        <Suspense fallback={<Chargement />}>
            {
                typeFromUrl == "Naissance" && <DemandeNaissanceForm />
            }

            {
                typeFromUrl == "Mariage" && <DemandeMariageForm />
            }
            
            {
                typeFromUrl == "Décès" && <DemandeDecesForm />
            }
        </Suspense>
    );
};

export default DemandePage;

const Chargement = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle className="animate-spin h-10 w-10 bg-primary" />
        </div>
    );
};
