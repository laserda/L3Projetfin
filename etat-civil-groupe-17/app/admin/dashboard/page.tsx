"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { ArrowUp, FileText, Clock, Check, X, CheckCheck } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate, getRequestTypeName, getStatusDemande } from "@/utils";
import { useEffect, useState } from "react";
import { Demande } from "@/lib/generated/prisma";
import { getDemandes } from "@/server/admin/demande";
import { Loader } from "@/components/Loader";
import Link from "next/link";

// Apparence des graphiques : uniquement les variables du thème (mode clair et sombre)
const tooltipStyle = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "calc(var(--radius) - 2px)",
    color: "hsl(var(--popover-foreground))",
    fontSize: 13,
};
const axisTick = { fill: "hsl(var(--muted-foreground))", fontSize: 12 };
const axisLine = { stroke: "hsl(var(--border))" };

const DashboardIndexPage = () => {
    const [demandes, setDemandes] = useState<Demande[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const fetchDemandes = async () => {
        setIsLoading(true)
        const res = await getDemandes();
        setDemandes(res);
        setIsLoading(false)
    }
    const demandesNaissance = demandes.filter(demande => demande.TypeActe === "Naissance")
    const demandesMariage = demandes.filter(demande => demande.TypeActe === "Mariage")
    const demandesDeces = demandes.filter(demande => demande.TypeActe === "Décès")

    const enAttente = demandes.filter(demande => demande.Statut === "SoumisePayee")
    const enTraitement = demandes.filter(demande => demande.Statut === "EnTraitement")
    const valide = demandes.filter(demande => demande.Statut === "Validée")
    const refuse = demandes.filter(demande => demande.Statut === "Refusée")
    const livree = demandes.filter(demande => demande.Statut === "Livrée")

    // Les 5 dernières demandes reçues
    const recentDemandes = [...demandes].sort((a, b) => {
        return new Date(b.DateDemande).getTime() - new Date(a.DateDemande).getTime();
    }).slice(0, 5)

    useEffect(() => {
        fetchDemandes();
    }, []);
    const pieChartData = [
        { name: "Naissance", value: demandesNaissance.length, color: "hsl(var(--chart-1))" },
        { name: "Mariage", value: demandesMariage.length, color: "hsl(var(--chart-2))" },
        { name: "Décès", value: demandesDeces.length, color: "hsl(var(--chart-5))" },
    ];

    const statusChartData = [
        { name: "En attente", value: enAttente.length, color: "hsl(var(--warning))" },
        { name: "En traitement", value: enTraitement.length, color: "hsl(var(--info))" },
        { name: "Approuvées", value: valide.length, color: "hsl(var(--success))" },
        { name: "Rejetées", value: refuse.length, color: "hsl(var(--destructive))" },
        { name: "Livrées", value: livree.length, color: "hsl(var(--secondary))" },
    ];

    const generalStats = [
        {
            title: "Total demandes",
            value: demandes.length,
            Icon: FileText,
            color: "bg-muted text-foreground",
        },
        {
            title: "En traitement",
            value: enTraitement.length,
            Icon: ArrowUp,
            color: "bg-info/10 text-info",
        },
        {
            title: "En attente",
            value: enAttente.length,
            Icon: Clock,
            color: "bg-warning/10 text-warning",
        },
        {
            title: "Validées",
            value: valide.length,
            Icon: Check,
            color: "bg-success/10 text-success",
        },
        {
            title: "Livrées",
            value: livree.length,
            Icon: CheckCheck,
            color: "bg-success/25 text-success",
        },
        {
            title: "Refusées",
            value: refuse.length,
            Icon: X,
            color: "bg-destructive/10 text-destructive",
        },
    ]

    // Obtenir l'icône et la couleur selon le statut
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "SoumisePayee":
                return {
                    icon: <Clock className="h-4 w-4" />,
                    color: "bg-warning/10 text-warning border-warning/30",
                };
            case "Validée":
                return {
                    icon: <Check className="h-4 w-4" />,
                    color: "bg-success/10 text-success border-success/30",
                };
            case "Livrée":
                return {
                    icon: <CheckCheck className="h-4 w-4" />,
                    color: "bg-success/10 text-success border-success/30",
                };
            case "Refusée":
                return {
                    icon: <X className="h-4 w-4" />,
                    color: "bg-destructive/10 text-destructive border-destructive/30",
                };
            case "EnTraitement":
                return {
                    icon: <ArrowUp className="h-4 w-4" />,
                    color: "bg-info/10 text-info border-info/30",
                };
            default:
                return {
                    icon: <FileText className="h-4 w-4" />,
                    color: "bg-muted text-muted-foreground border-border",
                };
        }
    };

    // Cellule du tableau des demandes récentes : sur téléphone, chaque ligne devient
    // une fiche (libellé à gauche, valeur à droite) ; à partir de lg, tableau classique.
    const cellule = "flex items-center justify-between gap-3 py-1.5 lg:table-cell lg:py-3 lg:px-4";
    const libelle = "text-muted-foreground lg:hidden";

    if (isLoading) {
        return <Loader />;
    }

    return (
        <div className="min-w-0 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
            </div>

            <section
                aria-label="Indicateurs"
                className="grid grid-cols-2 lg:grid-cols-3 gap-3"
            >
                {generalStats.map((card, idx) => (
                    <Card key={idx} className="gap-0 py-0">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium leading-tight text-muted-foreground">
                                    {card.title}
                                </p>
                                <div
                                    className={`${card.color} shrink-0 rounded-full p-2 sm:p-3`}
                                    aria-hidden="true"
                                >
                                    <card.Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                            </div>
                            <p className="mt-2 font-heading text-2xl sm:text-3xl font-bold text-foreground">
                                {card.value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="min-w-0">
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle>Répartition par type</CardTitle>
                        <CardDescription>
                            Distribution des demandes par type de document
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6">
                        <div className="h-72 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(
                                                0
                                            )}%`
                                        }
                                        outerRadius="55%"
                                        fill="hsl(var(--chart-1))"
                                        stroke="hsl(var(--card))"
                                        fontSize={12}
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend wrapperStyle={{ fontSize: 13 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-w-0">
                    <CardHeader className="px-4 sm:px-6">
                        <CardTitle>Statut des demandes</CardTitle>
                        <CardDescription>
                            Répartition des demandes par statut
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 sm:px-6">
                        <div className="h-72 sm:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={statusChartData}
                                    margin={{
                                        top: 20,
                                        right: 8,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="name"
                                        interval={0}
                                        angle={-30}
                                        textAnchor="end"
                                        height={60}
                                        tick={axisTick}
                                        axisLine={axisLine}
                                        tickLine={axisLine}
                                    />
                                    <YAxis
                                        width={32}
                                        allowDecimals={false}
                                        tick={axisTick}
                                        axisLine={axisLine}
                                        tickLine={axisLine}
                                    />
                                    <Tooltip
                                        contentStyle={tooltipStyle}
                                        cursor={{ fill: "hsl(var(--muted))" }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: 13 }} />
                                    <Bar
                                        dataKey="value"
                                        name="Nombre"
                                        fill="hsl(var(--chart-1))"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle>Demandes récentes</CardTitle>
                    <CardDescription>
                        Les 5 dernières demandes reçues
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    {recentDemandes.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                            Aucune demande n'a encore été enregistrée.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="hidden lg:table-header-group">
                                    <tr className="border-b bg-muted">
                                        <th className="text-left py-3 px-4 font-semibold">
                                            Référence
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold">
                                            Type
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold">
                                            Nom
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold">
                                            Statut
                                        </th>
                                        <th className="text-right py-3 px-4 font-semibold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="block lg:table-row-group">
                                    {recentDemandes.map((request: any) => {
                                        const statusInfo = getStatusInfo(
                                            request.Statut
                                        );
                                        return (
                                            <tr
                                                key={request.ID_Demande}
                                                className="block border-b py-3 last:border-b-0 lg:table-row lg:py-0 lg:hover:bg-muted"
                                            >
                                                <td className={cn(cellule, "font-semibold text-foreground")}>
                                                    <span className={libelle}>Référence</span>
                                                    {request.ID_Demande
                                                        .substring(0, 8)
                                                        .toUpperCase()}
                                                </td>
                                                <td className={cellule}>
                                                    <span className={libelle}>Type</span>
                                                    {getRequestTypeName(
                                                        request.TypeActe
                                                    )}
                                                </td>
                                                <td className={cellule}>
                                                    <span className={libelle}>Nom</span>
                                                    {request.Nom}
                                                </td>
                                                <td className={cellule}>
                                                    <span className={libelle}>Date</span>
                                                    {formatDate(
                                                        request.DateDemande.toDateString()
                                                    )}
                                                </td>
                                                <td className={cellule}>
                                                    <span className={libelle}>Statut</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={statusInfo.color}
                                                    >
                                                        {statusInfo.icon}
                                                        {getStatusDemande(request.Statut)}
                                                    </Badge>
                                                </td>
                                                <td className="block pt-2 lg:table-cell lg:py-3 lg:px-4 lg:text-right">
                                                    <Link
                                                        href={`/admin/dashboard/details-demande/${request.ID_Demande}`}
                                                        className={cn(
                                                            buttonVariants({ variant: "outline" }),
                                                            "min-h-11 w-full lg:w-auto"
                                                        )}
                                                    >
                                                        Voir
                                                    </Link>
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
        </div>
    );
};

export default DashboardIndexPage;
