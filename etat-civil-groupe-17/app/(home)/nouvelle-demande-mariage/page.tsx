"use client";
import { Suspense } from "react";

import DemandeMariageForm from "./demande-mariage-form";
import { Loader } from "@/components/Loader";

const DemandePage = () => {

    return (
        <Suspense fallback={<Loader />}>
            <DemandeMariageForm />
        </Suspense>
    );
};

export default DemandePage;
