"use client";
import { Suspense } from "react";

import { LoaderCircle } from "lucide-react";
import DemandeForm from "./demande-form";

const DemandePage = () => {
    return (
        <Suspense fallback={<Chargement />}>
            <DemandeForm />
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
