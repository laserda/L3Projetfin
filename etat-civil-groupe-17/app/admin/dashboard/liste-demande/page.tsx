"use client";
import { FC, useEffect, useState } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    FileText,
    Clock,
    Check,
    X,
    ArrowUp,
    Filter,
    RefreshCw,
    CheckCheck,
} from "lucide-react";

import { getDemandes } from "@/server/admin/demande";
import { Demande, StatutDemande, TypeActe } from "@/lib/generated/prisma";
import Link from "next/link";
import { formatDate, getRequestTypeName, getStatusDemande } from "@/utils";
import { Loader } from "@/components/Loader";
import { getStatusInfo } from "@/app/shared/common";

const DemandesListPage: FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtres
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatutDemande | "all">(
        "all"
    );
    const [typeFilter, setTypeFilter] = useState<TypeActe | "all">("all");


    // Charger les demandes
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const storedRequests = await getDemandes();

                // Trier par date de création (plus récent d'abord)
                const sortedRequests = [...storedRequests].sort((a, b) => {
                    return new Date(b.DateDemande).getTime() - new Date(a.DateDemande).getTime();
                })

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
                    req.ID_Demande.toLowerCase().includes(term) ||
                    req.Nom.toLowerCase().includes(term) ||
                    req.Prenom.toLowerCase().includes(term) ||
                    req.NumeroActe.toLowerCase().includes(term)
            );
        }

        // Filtre par statut
        if (statusFilter !== "all") {
            result = result.filter((req) => req.Statut === statusFilter);
        }

        // Filtre par type
        if (typeFilter !== "all") {
            result = result.filter((req) => req.TypeActe === typeFilter);
        }

        setFilteredRequests(result);
    }, [requests, searchTerm, statusFilter, typeFilter]);

    // Réinitialiser les filtres
    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setTypeFilter("all");
    };



    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
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
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                        value as StatutDemande | "all"
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
                                    {Object.values(StatutDemande).filter(s => s != StatutDemande.SoumiseEnAttenteDePaiment).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {getStatusDemande(type)}
                                        </SelectItem>
                                    ))}
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
                                    setTypeFilter(value as TypeActe | "all")
                                }
                            >
                                <SelectTrigger id="type-filter">
                                    <SelectValue placeholder="Tous les types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tous les types
                                    </SelectItem>
                                    {Object.values(TypeActe).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {getRequestTypeName(type)}
                                        </SelectItem>
                                    ))}
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
                            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-1">
                                Aucune demande trouvée
                            </h3>
                            <p className="text-muted-foreground text-center max-w-md">
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
                            <Table className="min-w-[48rem]">
                                <TableHeader>
                                    <TableRow className="bg-muted">
                                        <TableHead>
                                            Référence
                                        </TableHead>
                                        <TableHead>
                                            Type
                                        </TableHead>
                                        <TableHead>
                                            Nom
                                        </TableHead>
                                        <TableHead>
                                            Numéro d acte
                                        </TableHead>
                                        <TableHead>
                                            Date
                                        </TableHead>
                                        <TableHead>
                                            Statut
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((request) => {
                                        const statusInfo = getStatusInfo(
                                            request.Statut
                                        );
                                        return (
                                            <TableRow
                                                key={request.ID_Demande}
                                                className="hover:bg-muted"
                                            >
                                                <TableCell className="font-medium">
                                                    {request.ID_Demande
                                                        .substring(0, 8)
                                                        .toUpperCase()}
                                                </TableCell>
                                                <TableCell>
                                                    {getRequestTypeName(
                                                        request.TypeActe
                                                    )}
                                                </TableCell>
                                                <TableCell>{`${request.Nom} ${request.Prenom}`}</TableCell>
                                                <TableCell>
                                                    <span className="max-w-[150px] truncate inline-block">
                                                        {request.NumeroActe}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(
                                                        request.DateDemande.toDateString()
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            statusInfo.badge
                                                        }
                                                    >
                                                        <span className="flex items-center">
                                                            {statusInfo.icon}
                                                            <span className="ml-1">
                                                                {getStatusDemande(
                                                                    request.Statut
                                                                )}
                                                            </span>
                                                        </span>
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/admin/dashboard/details-demande/${request.ID_Demande}`}
                                                        className={buttonVariants({ variant: "outline" })}
                                                    >
                                                        Détails
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default DemandesListPage;