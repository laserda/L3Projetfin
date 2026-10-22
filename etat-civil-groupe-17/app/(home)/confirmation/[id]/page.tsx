"use client";
import { FC, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

import { getDemandePayer } from "@/server/demande/demande";
import { formatDate, getRequestTypeName, getStatusDemande } from "@/utils";

import { ActeNaissance } from "@/components/ActeNaissance";
import { ActeMariage } from "@/components/ActeMariage";
import { ActeDeces } from "@/components/ActeDeces";
import { Loader } from "@/components/Loader";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, FileText, Download } from "lucide-react";

const ConfirmationPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: request
            ? `${request.Nom}-${request.Prenom}-${request.TypeActe}`
            : "document",
        suppressErrors: true,
    });

    useEffect(() => {
        const fetchRequest = async () => {
            setLoading(true);
            try {
                const foundRequest = await getDemandePayer(id);
                setRequest(foundRequest?.Demande);
                // console.log(foundRequest);

            } catch (error) {
                console.error("Erreur lors de la récupération de la demande:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id]);

    const renderActeComponent = () => {
        if (!request) return null;

        switch (request.TypeActe) {
            case "Naissance":
                return (
                    <ActeNaissance ref={componentRef} ID_Demande={request.ID_Demande} />
                );
            case "Mariage":
                return (
                    <ActeMariage ref={componentRef} ID_Demande={request.ID_Demande} />
                );
            case "Décès":
                return <ActeDeces ref={componentRef} ID_Demande={request.ID_Demande} />;
            default:
                return null;
        }
    };

    if (loading) return <Loader />;

    if (!request) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-destructive">Demande introuvable</CardTitle>
                    <CardDescription>
                        Nous n'avons pas pu trouver votre demande. Veuillez vérifier l'URL
                        ou essayer à nouveau.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/#nos-services">
                        <Button>Faire une nouvelle demande</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="gap-0 overflow-hidden rounded-xl border-success/30 border-t-4 border-t-success py-0 shadow-lg">
                <CardHeader className="bg-success/10 border-b border-success/30 px-4 py-6 sm:px-6">
                    <div className="flex items-center justify-center mb-4">
                        <CheckCircle className="h-14 w-14 text-success sm:h-16 sm:w-16" />
                    </div>
                    <CardTitle className="text-center text-xl font-bold text-success sm:text-2xl">
                        Demande enregistrée avec succès !
                    </CardTitle>
                    <CardDescription className="text-center text-base text-success sm:text-sm">
                        Votre demande a été enregistrée dans notre système.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pt-6 sm:px-6">
                    {/* Numéro de suivi : toujours visible, en tête, et lisible en entier sur téléphone */}
                    <div
                        data-slot="numero-suivi"
                        className="mb-4 rounded-lg border-2 border-primary/40 bg-primary/5 p-4 text-center"
                    >
                        <p className="text-sm font-medium text-muted-foreground">Référence :</p>
                        <p className="mt-1 break-all font-mono text-base font-bold text-foreground sm:text-lg">
                            {request.ID_Demande}
                        </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg mb-6">
                        <h3 className="font-semibold text-foreground mb-2">
                            Récapitulatif de votre demande
                        </h3>
                        <div className="space-y-3 text-sm break-words">
                            <p>
                                <span className="font-medium">Type de document :</span>{" "}
                                {getRequestTypeName(request.TypeActe)}
                            </p>
                            <p>
                                <span className="font-medium">Nom du demandeur :</span> {request.Nom}
                            </p>
                            <p>
                                <span className="font-medium">Prénom du demandeur :</span> {request.Prenom}
                            </p>
                            <p>
                                <span className="font-medium">Date de l'évènement :</span>{" "}
                                {request.DateActe?.toDateString()}
                            </p>
                            <p>
                                <span className="font-medium">Email du demandeur :</span>{" "}
                                {request.Email}
                            </p>
                            <p>
                                <span className="font-medium">Date de soumission :</span>{" "}
                                {formatDate(request.DateDemande.toDateString())}
                            </p>
                            <p>
                                <span className="font-medium">Statut actuel :</span>{" "}
                                <span className="text-warning font-medium">
                                    {getStatusDemande(request.Statut)}
                                </span>
                            </p>
                        </div>
                    </div>

                    {request.Statut !== "Livrée" && (
                        <div className="bg-info/10 p-4 rounded-lg border border-info/30">
                            <h3 className="font-medium text-info mb-2">
                                Que se passe-t-il maintenant ?
                            </h3>
                            <ul className="space-y-2 text-info text-sm [overflow-wrap:anywhere]">
                                <li className="flex items-start">
                                    <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Notre équipe va traiter votre demande dans un délai de 24 à
                                        48 heures.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Vous recevrez un email de confirmation à l'adresse{" "}
                                        {request.Email}.
                                    </span>
                                </li>
                                <li className="flex items-start">
                                    <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>
                                        Vous pourrez suivre l'état de votre demande en utilisant la
                                        référence indiquée ci-dessus.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col-reverse items-stretch gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 [&_button]:h-11 [&_button]:w-full [&_button]:text-base sm:[&_button]:w-auto md:[&_button]:h-10 md:[&_button]:text-sm">
                    <Button variant={"outline"} onClick={() => router.push("/suivi-demande")}>
                        Retour
                    </Button>
                    {request.Statut === "Livrée" ? (
                        <>
                            <Button onClick={() => { handlePrint() }}>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger le document
                            </Button>
                            <div className="hidden">
                                {renderActeComponent()}
                            </div>
                        </>
                    ) : (
                        <Link href="/suivi-demande">
                            <Button>
                                <FileText className="mr-2 h-4 w-4" />
                                Suivre ma demande
                            </Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>


        </div>
    );
};

export default ConfirmationPage;
