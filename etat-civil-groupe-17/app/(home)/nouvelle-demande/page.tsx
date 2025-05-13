"use client";
import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { TypeActe } from "@/lib/generated/prisma";
import DemandeNaissanceForm from "./demande-naissance-form";
import DemandeMariageForm from "./demande-mariage-form";
import DemandeDecesForm from "./demande-deces-form";
import { Loader } from "@/components/Loader";

const DemandePage = () => {
    const searchParams = useSearchParams();

    const typeFromUrl = searchParams.get("type") as TypeActe;

    return (
        <Suspense fallback={<Loader />}>
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
