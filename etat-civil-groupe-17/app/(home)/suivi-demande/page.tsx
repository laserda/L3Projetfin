"use client";
import { useState } from "react";

import { Request } from "@/types";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, FileText, AlertCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// import {
//     emailFormSchema,
//     EmailFormValues,
//     suiviFormSchema,
//     SuiviFormValues,
// } from "@/validation";
import { formatDate, getRequestTypeName } from "@/utils";

const SuiviPage = () => {
    const [request, setRequest] = useState<Request | null>(null);
    const [requestsFound, setRequestsFound] = useState<Request[]>([]);
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Formulaire de recherche par référence
    const refForm = useForm({
        // resolver: zodResolver(suiviFormSchema),
        defaultValues: {
            reference: "",
        },
    });

    // Formulaire de recherche par email
    const emailForm = useForm({
        // resolver: zodResolver(emailFormSchema),
        defaultValues: {
            email: "",
        },
    });

    // Recherche par référence
    const onSearchByRef = (data: any) => {
        // Reset previous search results
        setRequest(null);
        setRequestsFound([]);
        setSearchPerformed(true);

        try {
            // Dans un vrai cas, ce serait une requête Supabase
            const requests = JSON.parse(
                localStorage.getItem("requests") || "[]"
            );

            // Recherche avec une référence qui peut être partielle
            const foundRequest = requests.find((r: Request) =>
                r.id.toLowerCase().includes(data.reference.toLowerCase())
            );

            if (foundRequest) {
                setRequest(foundRequest);
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        }
    };

    // Recherche par email
    const onSearchByEmail = (data: any) => {
        // Reset previous search results
        setRequest(null);
        setRequestsFound([]);
        setSearchPerformed(true);

        try {
            // Dans un vrai cas, ce serait une requête Supabase
            const requests = JSON.parse(
                localStorage.getItem("requests") || "[]"
            );

            // Filtrer par email
            const foundRequests = requests.filter(
                (r: Request) =>
                    r.email.toLowerCase() === data.email.toLowerCase()
            );

            if (foundRequests.length > 0) {
                setRequestsFound(foundRequests);
            }
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        }
    };

    // Fonction pour afficher le status de la demande
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                        En attente
                    </Badge>
                );
            case "approved":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        Approuvée
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                    >
                        Rejetée
                    </Badge>
                );
            case "inProgress":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                        En traitement
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Rendu d'une demande
    const renderRequestDetails = (request: Request) => (
        <div
            key={request.id}
            className="mb-6 border rounded-lg overflow-hidden"
        >
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b">
                <div>
                    <h3 className="font-medium text-gray-800">
                        {getRequestTypeName(request.type)}
                    </h3>
                    <p className="text-sm text-gray-500">
                        Référence: {request.id.substring(0, 8).toUpperCase()}
                    </p>
                </div>
                {renderStatusBadge(request.statut)}
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-medium">{request.nom}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Prénom</p>
                        <p className="font-medium">{request.prenom}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{request.date}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Lieu</p>
                        <p className="font-medium">{request.lieu}</p>
                    </div>
                    {request.parents && (
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500">Parents</p>
                            <p className="font-medium">{request.parents}</p>
                        </div>
                    )}
                    <div className="col-span-2">
                        <p className="text-sm text-gray-500">Soumis le</p>
                        <p className="font-medium">
                            {formatDate(request.created_at)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Afficher un message si aucun résultat
    const renderNoResults = () => (
        <div className="text-center py-10">
            <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
                Aucune demande trouvée
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Nous n'avons pas pu trouver de demande correspondant à votre
                recherche. Veuillez vérifier les informations saisies.
            </p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Suivre ma demande</CardTitle>
                    <CardDescription>
                        Consultez l'état de votre demande d'acte d'état civil
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="reference">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="reference">
                                Par référence
                            </TabsTrigger>
                            <TabsTrigger value="email">Par email</TabsTrigger>
                        </TabsList>

                        <TabsContent value="reference">
                            <Alert className="mb-6">
                                <FileText className="h-4 w-4" />
                                <AlertTitle>Suivi par référence</AlertTitle>
                                <AlertDescription>
                                    Saisissez la référence de votre demande pour
                                    consulter son état d'avancement.
                                </AlertDescription>
                            </Alert>

                            <Form {...refForm}>
                                <form
                                    onSubmit={refForm.handleSubmit(
                                        onSearchByRef
                                    )}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={refForm.control}
                                        name="reference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Référence de la demande
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Exemple: ABC123"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="bg-ci-orange hover:bg-ci-orange/90 w-full"
                                    >
                                        <Search className="mr-2" /> Rechercher
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="email">
                            <Alert className="mb-6">
                                <FileText className="h-4 w-4" />
                                <AlertTitle>Suivi par email</AlertTitle>
                                <AlertDescription>
                                    Entrez l'adresse email associée à votre
                                    demande.
                                </AlertDescription>
                            </Alert>

                            <Form {...emailForm}>
                                <form
                                    onSubmit={emailForm.handleSubmit(
                                        onSearchByEmail
                                    )}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Adresse email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="votre-email@example.com"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="bg-ci-orange hover:bg-ci-orange/90 w-full"
                                    >
                                        <Search className="mr-2" /> Rechercher
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter>
                    {searchPerformed && (
                        <div className="space-y-4">
                            {request && renderRequestDetails(request)}
                            {requestsFound.length > 0 &&
                                requestsFound.map(renderRequestDetails)}
                            {requestsFound.length === 0 &&
                                !request &&
                                renderNoResults()}
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default SuiviPage;
