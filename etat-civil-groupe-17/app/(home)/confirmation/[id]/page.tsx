"use client";
import { FC, useEffect, useState } from "react";

import { DemandeResquest, Request } from "@/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDate, getRequestTypeName, getStatusDemande } from "@/utils";
import { getDemande } from "@/server/demande/demande";

const ConfirmationPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const [request, setRequest] = useState<DemandeResquest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequest = async () => {
            setLoading(true);
            try {
                // const requests = JSON.parse(
                //     localStorage.getItem("requests") || "[]"
                // );
                // const foundRequest = requests.find((r: Request) => r.id === id);
                const foundRequest = await getDemande(id);
                console.log(id)
                console.log(foundRequest)

                if (foundRequest) {
                    setRequest(foundRequest);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération de la demande:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-pulse text-ci-orange">
                    Chargement...
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-red-500">
                        Demande introuvable
                    </CardTitle>
                    <CardDescription>
                        Nous n'avons pas pu trouver votre demande. Veuillez
                        vérifier l'URL ou essayer à nouveau.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/demande">
                        <Button>Faire une nouvelle demande</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="border-green-100 shadow-lg">
                <CardHeader className="bg-green-50 border-b border-green-100">
                    <div className="flex items-center justify-center mb-4">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-center text-2xl text-green-700">
                        Demande enregistrée avec succès !
                    </CardTitle>
                    <CardDescription className="text-center text-green-600">
                        Votre demande a été enregistrée dans notre système.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h3 className="font-medium text-gray-800 mb-2">
                            Récapitulatif de votre demande
                        </h3>

                        <div className="space-y-3 text-sm">
                            <p>
                                <span className="font-medium">Référence :</span>{" "}
                                {request.ID_Demande}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Type de document :
                                </span>{" "}
                                {getRequestTypeName(request.TypeActe)}
                            </p>
                            <p>
                                <span className="font-medium">Nom :</span>{" "}
                                {request.Nom}
                            </p>
                            <p>
                                <span className="font-medium">Prénom :</span>{" "}
                                {request.Prenom}
                            </p>
                            {/* {request.parents && (
                                <p>
                                    <span className="font-medium">
                                        Parents :
                                    </span>{" "}
                                    {request.parents}
                                </p>
                            )} */}
                            <p>
                                <span className="font-medium">Date :</span>{" "}
                                {request.DateActe?.toDateString()}
                            </p>
                            {/* <p>
                                <span className="font-medium">Lieu :</span>{" "}
                                {request.lieu}
                            </p> */}
                            <p>
                                <span className="font-medium">Email :</span>{" "}
                                {request.Citoyen.Email}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Date de soumission :
                                </span>{" "}
                                {formatDate(request.DateDemande.toDateString())}
                            </p>
                            <p>
                                <span className="font-medium">
                                    Statut actuel :
                                </span>{" "}
                                <span className="text-yellow-600 font-medium">
                                    {getStatusDemande(request.Statut)}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-medium text-blue-800 mb-2">
                            Que se passe-t-il maintenant ?
                        </h3>
                        <ul className="space-y-2 text-blue-700 text-sm">
                            <li className="flex items-start">
                                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>
                                    Notre équipe va traiter votre demande dans
                                    un délai de 24 à 48 heures.
                                </span>
                            </li>
                            <li className="flex items-start">
                                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>
                                    Vous recevrez un email de confirmation à
                                    l'adresse {request.Citoyen.Email}.
                                </span>
                            </li>
                            <li className="flex items-start">
                                <ArrowRight className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                <span>
                                    Vous pourrez suivre l'état de votre demande
                                    en utilisant la référence indiquée
                                    ci-dessus.
                                </span>
                            </li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between flex-wrap gap-3">
                    <Link href="/">
                        <Button variant="outline">Retour à l'accueil</Button>
                    </Link>
                    <Link href="/suivi-demande">
                        <Button className="bg-ci-orange hover:bg-ci-orange/90">
                            <FileText className="mr-2 h-4 w-4" />
                            Suivre ma demande
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ConfirmationPage;
