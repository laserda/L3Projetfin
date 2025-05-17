"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    FileText,
    Mail,
    Clock,
    Check,
    X,
    ArrowUp,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agent, Demande, StatutDemande } from "@/lib/generated/prisma";
import { getDemande, updateDemandeStatus } from "@/server/admin/demande";
import { Loader } from "@/components/Loader";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExtraitNaissance } from "@/components/ExtraitNaissance";
import { getAgent } from "@/server/auth/agent";

const DemandeDetailPage = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const [request, setRequest] = useState<Demande>();
    const [agent, setAgent] = useState<Agent>();
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [open, setOpen] = useState(false);

    const componentRef = useRef<HTMLDivElement>(null);
    const reactToPrintContent = () => {
        return componentRef.current;
    };
    const handlePrint = useReactToPrint({
        documentTitle: `${request?.Nom}-${request?.Prenom}`,
    });



    useEffect(() => {
        const fetchRequest = async () => {
            setLoading(true);
            try {
                const foundRequest: Demande = await getDemande(id);

                const res: Agent = await getAgent();
                setAgent(res);
                // return agent;

                if (foundRequest) {
                    setRequest(foundRequest);
                }
            } catch (error) {
                console.error(
                    "Erreur lors du chargement de la demande:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id]);

    const updateStatus = async (status: StatutDemande) => {
        setUpdatingStatus(true);
        const res = await updateDemandeStatus(id, status)
        setUpdatingStatus(false);
        setRequest(res);
    };

    const sendEmail = async () => {

    };


    const getRequestTypeName = (type: string) => {
        switch (type) {
            case "Naissance":
                return "Acte de naissance";
            case "Mariage":
                return "Acte de mariage";
            case "Décès":
                return "Acte de décès";
            default:
                return type;
        }
    };

    const getStatusInfo = (status: StatutDemande) => {
        switch (status) {
            case "SoumisePayee":
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: "text-yellow-500",
                    bg: "bg-yellow-100",
                };
            case "Validée":
                return {
                    icon: <Check className="h-5 w-5" />,
                    color: "text-green-500",
                    bg: "bg-green-100",
                };
            case "Refusée":
                return {
                    icon: <X className="h-5 w-5" />,
                    color: "text-red-500",
                    bg: "bg-red-100",
                };
            case "EnTraitement":
                return {
                    icon: <ArrowUp className="h-5 w-5" />,
                    color: "text-blue-500",
                    bg: "bg-blue-100",
                };
            default:
                return {
                    icon: null,
                    color: "text-gray-500",
                    bg: "bg-gray-100",
                };
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (!request) {
        return (
            <>
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-red-500">
                            Demande introuvable
                        </CardTitle>
                        <CardDescription>
                            Nous n'avons pas pu trouver cette demande. Veuillez
                            vérifier l'URL ou retourner à la liste des demandes.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button onClick={() => { }}>Retour à la liste</Button>
                    </CardFooter>
                </Card>
            </>
        );
    }

    const statusInfo = getStatusInfo(request.Statut);

    return (
        <>
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => {
                    router.back()
                }} className="mr-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <h1 className="text-2xl font-bold">Détails de la demande</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="mb-2">
                                        {getRequestTypeName(request.TypeActe)}
                                    </CardTitle>
                                    <CardDescription>
                                        Référence:{" "}
                                        {request.ID_Demande
                                            .substring(0, 8)
                                            .toUpperCase()}
                                    </CardDescription>
                                </div>
                                <div
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
                                >
                                    {statusInfo.icon}
                                    <span className="font-medium">
                                        {request.Statut === "SoumiseEnAttenteDePaiment" &&
                                            "En attente de paiement"}
                                        {request.Statut === "Validée" &&
                                            "Validée"}
                                        {request.Statut === "Refusée" &&
                                            "Refusée"}
                                        {request.Statut === "EnTraitement" &&
                                            "En traitement"}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>

                        <Tabs defaultValue="details">
                            <CardContent>
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="details">
                                        Détails
                                    </TabsTrigger>
                                    <TabsTrigger value="history">
                                        Historique
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="details">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Nom
                                                </h3>
                                                <p className="mt-1">
                                                    {request.Nom}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Prénom
                                                </h3>
                                                <p className="mt-1">
                                                    {request.Prenom}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Date
                                                </h3>
                                                <p className="mt-1">
                                                    {request.DateDemande.toDateString()}
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Paiement
                                                </h3>
                                                <p className="mt-1">
                                                    {request.ID_Paiement ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-green-50 text-green-600 border-green-200"
                                                        >
                                                            Frais de timbre
                                                            payés
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-red-50 text-red-600 border-red-200"
                                                        >
                                                            Paiement non
                                                            confirmé
                                                        </Badge>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-2">
                                                Date de soumission
                                            </h3>
                                            <p>
                                                {(request.DateDemande.toString())}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="history">
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <ArrowUp className="h-4 w-4 text-blue-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Demande créée
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(
                                                        request.DateDemande.toString()
                                                    )}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    La demande a été soumise par
                                                    l'utilisateur.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-3">
                                                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                                    <Clock className="h-4 w-4 text-yellow-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    Statut initial
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {(
                                                        request.Statut
                                                    )}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    La demande a été mise en
                                                    attente de traitement.
                                                </p>
                                            </div>
                                        </div>

                                        {request.Statut !== "SoumiseEnAttenteDePaiment" && (
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-3">
                                                    <div
                                                        className={`h-8 w-8 rounded-full ${statusInfo.bg} flex items-center justify-center`}
                                                    >
                                                        {statusInfo.icon}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {request.Statut ===
                                                            "Validée" &&
                                                            "Demande validée"}
                                                        {request.Statut ===
                                                            "Refusée" &&
                                                            "Demande Refusée"}
                                                        {request.Statut ===
                                                            "EnTraitement" &&
                                                            "Demande en traitement"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Date inconnue
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        {request.Statut ===
                                                            "Validée" &&
                                                            "La demande a été approuvée par un agent."}
                                                        {request.Statut ===
                                                            "Refusée" &&
                                                            "La demande a été rejetée par un agent."}
                                                        {request.Statut ===
                                                            "EnTraitement" &&
                                                            "La demande est en cours de traitement."}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                            <CardDescription>
                                Gérer le traitement de cette demande
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                {request.Statut === "SoumisePayee" &&
                                    <>
                                        <h3 className="text-sm font-medium mb-2">
                                            M'occuper de la demande
                                        </h3>
                                        <Button
                                            className="w-full mt-2"
                                            disabled={updatingStatus}
                                            onClick={() => updateStatus('EnTraitement')}
                                        >
                                            {updatingStatus
                                                ? "..."
                                                : "M'occuper de la demande"}
                                        </Button>
                                    </>
                                }
                                {request.Statut === "EnTraitement" &&
                                    <>
                                        <h3 className="text-sm font-medium mb-2">
                                            Validée la demande
                                        </h3>
                                        <Button
                                            className="w-full mt-2"
                                            disabled={updatingStatus}
                                            onClick={() => updateStatus('Validée')}
                                        >
                                            {updatingStatus
                                                ? "..."
                                                : "Valider la demande"}
                                        </Button>
                                        <h3 className="text-sm font-medium my-3">
                                            Refusée la demande
                                        </h3>
                                        <Button
                                            // className="w-full"
                                            disabled={updatingStatus}
                                            onClick={() => updateStatus('Refusée')}
                                            variant={"secondary"}
                                        >
                                            {updatingStatus
                                                ? "..."
                                                : "Refusée la demande"}
                                        </Button>
                                    </>
                                }
                                {request.Statut === "Validée" && <Button
                                    className="w-full mt-2"
                                    disabled={updatingStatus}
                                // onClick={() => updateStatus('')}
                                >
                                    {updatingStatus
                                        ? "..."
                                        : "Signer la demande"}
                                </Button>}
                                {request.Statut === "Livrée" && <Button
                                    className="w-full mt-2"
                                    disabled={updatingStatus}
                                // onClick={() => updateStatus('')}
                                >
                                    {updatingStatus
                                        ? "..."
                                        : "M'occuper de la demande"}
                                </Button>}

                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-sm font-medium mb-2">
                                    Actions sur le document
                                </h3>
                                <div className="grid grid-cols-1 gap-2">

                                    <Button
                                        variant="outline"
                                        onClick={() => handlePrint(reactToPrintContent)}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Générer le PDF
                                    </Button>
                                    <div className="hidden">
                                        {agent && <ExtraitNaissance ref={componentRef} infos={request} currentAgent={agent} />}
                                    </div>

                                    <Button
                                        // className="w-full"
                                        variant="outline"
                                        onClick={sendEmail}
                                        disabled={sendingEmail}
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        {sendingEmail
                                            ? "Envoi..."
                                            : "Envoyer par email"}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>





        </>
    );
};

export default DemandeDetailPage;