"use client";
import { FC, useEffect, useState } from "react";

import { Request, RequestStatus, RequestType } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    Search,
    FileText,
    Clock,
    Check,
    X,
    ArrowUp,
    Filter,
    RefreshCw,
} from "lucide-react";

import { stats, recentRequests } from "../data";

const DemandesListPage: FC = () => {
    //   const navigate = useNavigate();
    //   const { user, isAdmin, logout } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtres
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
        "all"
    );
    const [typeFilter, setTypeFilter] = useState<RequestType | "all">("all");

    // Rediriger si l'utilisateur n'est pas connecté ou n'est pas admin
    //   useEffect(() => {
    //     if (!user) {
    //       navigate('/login');
    //     } else if (!isAdmin) {
    //       navigate('/');
    //     }
    //   }, [user, isAdmin, navigate]);

    // Charger les demandes
    useEffect(() => {
        const fetchRequests = () => {
            setLoading(true);
            try {
                // Simuler une requête Supabase
                const storedRequests: Request[] = recentRequests;

                // Trier par date de création (plus récent d'abord)
                const sortedRequests = [...storedRequests].sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );

                setRequests(sortedRequests);
                setFilteredRequests(sortedRequests);
            } catch (error) {
                console.error("Erreur lors du chargement des demandes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Appliquer les filtres
    useEffect(() => {
        let result = [...requests];

        // Filtre par terme de recherche
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (req) =>
                    req.id.toLowerCase().includes(term) ||
                    req.nom.toLowerCase().includes(term) ||
                    req.prenom.toLowerCase().includes(term) ||
                    req.email.toLowerCase().includes(term)
            );
        }

        // Filtre par statut
        if (statusFilter !== "all") {
            result = result.filter((req) => req.statut === statusFilter);
        }

        // Filtre par type
        if (typeFilter !== "all") {
            result = result.filter((req) => req.type === typeFilter);
        }

        setFilteredRequests(result);
    }, [requests, searchTerm, statusFilter, typeFilter]);

    // Réinitialiser les filtres
    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setTypeFilter("all");
    };

    // Formater les dates
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
    };

    // Obtenir le nom du type de demande
    const getRequestTypeName = (type: string) => {
        switch (type) {
            case "naissance":
                return "Naissance";
            case "mariage":
                return "Mariage";
            case "deces":
                return "Décès";
            default:
                return type;
        }
    };

    // Obtenir l'icône et la couleur selon le statut
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    icon: <Clock className="h-4 w-4" />,
                    color: "text-yellow-500",
                    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
                };
            case "approved":
                return {
                    icon: <Check className="h-4 w-4" />,
                    color: "text-green-500",
                    badge: "bg-green-50 text-green-700 border-green-200",
                };
            case "rejected":
                return {
                    icon: <X className="h-4 w-4" />,
                    color: "text-red-500",
                    badge: "bg-red-50 text-red-700 border-red-200",
                };
            case "inProgress":
                return {
                    icon: <ArrowUp className="h-4 w-4" />,
                    color: "text-blue-500",
                    badge: "bg-blue-50 text-blue-700 border-blue-200",
                };
            default:
                return {
                    icon: <FileText className="h-4 w-4" />,
                    color: "text-gray-500",
                    badge: "bg-gray-50 text-gray-700 border-gray-200",
                };
        }
    };

    // Obtenir le texte du statut
    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "En attente";
            case "approved":
                return "Approuvée";
            case "rejected":
                return "Rejetée";
            case "inProgress":
                return "En traitement";
            default:
                return status;
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

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Liste des demandes</h1>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="flex items-center"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réinitialiser
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Filtres</CardTitle>
                    <CardDescription>
                        Filtrez les demandes selon différents critères
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label
                                htmlFor="search"
                                className="text-sm font-medium block mb-1"
                            >
                                Recherche
                            </label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="search"
                                    placeholder="Nom, email, référence..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="status-filter"
                                className="text-sm font-medium block mb-1"
                            >
                                Statut
                            </label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) =>
                                    setStatusFilter(
                                        value as RequestStatus | "all"
                                    )
                                }
                            >
                                <SelectTrigger id="status-filter">
                                    <SelectValue placeholder="Tous les statuts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tous les statuts
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        En attente
                                    </SelectItem>
                                    <SelectItem value="inProgress">
                                        En traitement
                                    </SelectItem>
                                    <SelectItem value="approved">
                                        Approuvées
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejetées
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label
                                htmlFor="type-filter"
                                className="text-sm font-medium block mb-1"
                            >
                                Type de document
                            </label>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) =>
                                    setTypeFilter(value as RequestType | "all")
                                }
                            >
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="Tous les types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tous les types
                                    </SelectItem>
                                    <SelectItem value="naissance">
                                        Naissance
                                    </SelectItem>
                                    <SelectItem value="mariage">
                                        Mariage
                                    </SelectItem>
                                    <SelectItem value="deces">Décès</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    {filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <Filter className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                                Aucune demande trouvée
                            </h3>
                            <p className="text-gray-500 text-center max-w-md">
                                Aucune demande ne correspond à vos critères de
                                filtrage. Essayez de modifier vos filtres ou de
                                créer une nouvelle demande.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={resetFilters}
                            >
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-medium">
                                            Référence
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Type
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Nom
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 font-medium">
                                            Statut
                                        </th>
                                        <th className="text-right py-3 px-4 font-medium">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map((request) => {
                                        const statusInfo = getStatusInfo(
                                            request.statut
                                        );
                                        return (
                                            <tr
                                                key={request.id}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4 font-medium">
                                                    {request.id
                                                        .substring(0, 8)
                                                        .toUpperCase()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {getRequestTypeName(
                                                        request.type
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">{`${request.nom} ${request.prenom}`}</td>
                                                <td className="py-3 px-4">
                                                    <span className="max-w-[150px] truncate inline-block">
                                                        {request.email}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatDate(
                                                        request.created_at
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            statusInfo.badge
                                                        }
                                                    >
                                                        <span className="flex items-center">
                                                            {statusInfo.icon}
                                                            <span className="ml-1">
                                                                {getStatusText(
                                                                    request.statut
                                                                )}
                                                            </span>
                                                        </span>
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {}}
                                                    >
                                                        Détails
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default DemandesListPage;
