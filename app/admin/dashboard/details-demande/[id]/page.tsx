"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Request, RequestStatus } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

const DemandeDetailPage = () => {
    const params = useParams();
    const id = params?.id as string;

    const [request, setRequest] = useState<Request | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] =
        useState<RequestStatus>("pending");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        const fetchRequest = () => {
            setLoading(true);
            try {
                const requests: Request[] = JSON.parse(
                    localStorage.getItem("requests") || "[]"
                );
                const foundRequest = requests.find((r) => r.id === id);

                if (foundRequest) {
                    setRequest(foundRequest);
                    setCurrentStatus(foundRequest.statut);
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

    const updateStatus = async () => {
        if (!request || currentStatus === request.statut) return;

        setUpdatingStatus(true);
        try {
            const requests: Request[] = JSON.parse(
                localStorage.getItem("requests") || "[]"
            );
            const updatedRequests = requests.map((r) => {
                if (r.id === id) {
                    return { ...r, statut: currentStatus };
                }
                return r;
            });

            localStorage.setItem("requests", JSON.stringify(updatedRequests));

            setRequest((prev) =>
                prev ? { ...prev, statut: currentStatus } : null
            );

            toast.success("Statut mis à jour avec succès");

            console.log(
                `Email envoyé à ${request.email} pour notifier du changement de statut: ${currentStatus}`
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour du statut:", error);
            toast.error("Erreur lors de la mise à jour du statut");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const generatePdf = async () => {
        if (!request) return;

        setGeneratingPdf(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            toast.success("Document PDF généré avec succès", {
                description:
                    "Le document a été généré et est prêt à être téléchargé.",
            });

            console.log(`PDF généré pour la demande ${request.id}`);
        } catch (error) {
            console.error("Erreur lors de la génération du PDF:", error);
            toast.error("Erreur lors de la génération du PDF");
        } finally {
            setGeneratingPdf(false);
        }
    };

    const sendEmail = async () => {
        if (!request) return;

        setSendingEmail(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success("Email envoyé avec succès", {
                description: `Un email a été envoyé à ${request.email}`,
            });

            console.log(
                `Email envoyé à ${request.email} pour la demande ${request.id}`
            );
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            toast.error("Erreur lors de l'envoi de l'email");
        } finally {
            setSendingEmail(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getRequestTypeName = (type: string) => {
        switch (type) {
            case "naissance":
                return "Acte de naissance";
            case "mariage":
                return "Acte de mariage";
            case "deces":
                return "Acte de décès";
            default:
                return type;
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    icon: <Clock className="h-5 w-5" />,
                    color: "text-yellow-500",
                    bg: "bg-yellow-100",
                };
            case "approved":
                return {
                    icon: <Check className="h-5 w-5" />,
                    color: "text-green-500",
                    bg: "bg-green-100",
                };
            case "rejected":
                return {
                    icon: <X className="h-5 w-5" />,
                    color: "text-red-500",
                    bg: "bg-red-100",
                };
            case "inProgress":
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
        return (
            <>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse text-ci-orange">
                        Chargement...
                    </div>
                </div>
            </>
        );
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
                        <Button onClick={() => {}}>Retour à la liste</Button>
                    </CardFooter>
                </Card>
            </>
        );
    }

    const statusInfo = getStatusInfo(request.statut);

    return (
        <>
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={() => {}} className="mr-4">
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
                                    <CardTitle>
                                        {getRequestTypeName(request.type)}
                                    </CardTitle>
                                    <CardDescription>
                                        Référence:{" "}
                                        {request.id
                                            .substring(0, 8)
                                            .toUpperCase()}
                                    </CardDescription>
                                </div>
                                <div
                                    className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}
                                >
                                    {statusInfo.icon}
                                    <span className="font-medium">
                                        {request.statut === "pending" &&
                                            "En attente"}
                                        {request.statut === "approved" &&
                                            "Approuvée"}
                                        {request.statut === "rejected" &&
                                            "Rejetée"}
                                        {request.statut === "inProgress" &&
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
                                                    {request.nom}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Prénom
                                                </h3>
                                                <p className="mt-1">
                                                    {request.prenom}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Date
                                                </h3>
                                                <p className="mt-1">
                                                    {request.date}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Lieu
                                                </h3>
                                                <p className="mt-1">
                                                    {request.lieu}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2">
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Parents
                                                </h3>
                                                <p className="mt-1">
                                                    {request.parents ||
                                                        "Non spécifié"}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Email
                                                </h3>
                                                <p className="mt-1">
                                                    {request.email}
                                                </p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-500">
                                                    Paiement
                                                </h3>
                                                <p className="mt-1">
                                                    {request.paymentConfirmed ? (
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
                                                {formatDate(request.created_at)}
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
                                                    {formatDate(
                                                        request.created_at
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
                                                    {formatDate(
                                                        request.created_at
                                                    )}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    La demande a été mise en
                                                    attente de traitement.
                                                </p>
                                            </div>
                                        </div>

                                        {request.statut !== "pending" && (
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
                                                        {request.statut ===
                                                            "approved" &&
                                                            "Demande approuvée"}
                                                        {request.statut ===
                                                            "rejected" &&
                                                            "Demande rejetée"}
                                                        {request.statut ===
                                                            "inProgress" &&
                                                            "Demande en traitement"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Date inconnue
                                                    </p>
                                                    <p className="text-sm mt-1">
                                                        {request.statut ===
                                                            "approved" &&
                                                            "La demande a été approuvée par un agent."}
                                                        {request.statut ===
                                                            "rejected" &&
                                                            "La demande a été rejetée par un agent."}
                                                        {request.statut ===
                                                            "inProgress" &&
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
                                <h3 className="text-sm font-medium mb-2">
                                    Modifier le statut
                                </h3>
                                <Select
                                    value={currentStatus}
                                    onValueChange={(value) =>
                                        setCurrentStatus(value as RequestStatus)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            En attente
                                        </SelectItem>
                                        <SelectItem value="inProgress">
                                            En traitement
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Approuvée
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Rejetée
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    className="w-full mt-2"
                                    disabled={
                                        updatingStatus ||
                                        currentStatus === request.statut
                                    }
                                    onClick={updateStatus}
                                >
                                    {updatingStatus
                                        ? "Mise à jour..."
                                        : "Mettre à jour le statut"}
                                </Button>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-sm font-medium mb-2">
                                    Actions sur le document
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={generatePdf}
                                        disabled={generatingPdf}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        {generatingPdf
                                            ? "Génération..."
                                            : "Générer un PDF"}
                                    </Button>

                                    <Button
                                        className="w-full"
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
