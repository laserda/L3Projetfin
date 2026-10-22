"use client";
import { useEffect, useState } from "react";

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
    LineChart,
    Line,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDemandes } from "@/server/admin/demande";
import { Demande } from "@/lib/generated/prisma";
import { Loader } from "@/components/Loader";

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
const chartMargin = { top: 20, right: 8, left: 0, bottom: 5 };

const Page = () => {
    const [requests, setRequests] = useState<Demande[]>([]);
    const [loading, setLoading] = useState(true);

    // Charger les demandes
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const storedRequests = await getDemandes();
                setRequests(storedRequests);
            } catch (error) {
                console.error("Erreur lors du chargement des demandes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    // Générer les données pour les graphiques
    const getChartData = () => {
        // Statistiques par type
        const byType = [
            {
                name: "Naissance",
                value: requests.filter((r) => r.TypeActe === "Naissance").length,
                color: "hsl(var(--chart-1))",
            },
            {
                name: "Mariage",
                value: requests.filter((r) => r.TypeActe === "Mariage").length,
                color: "hsl(var(--chart-2))",
            },
            {
                name: "Décès",
                value: requests.filter((r) => r.TypeActe === "Décès").length,
                color: "hsl(var(--chart-5))",
            },
        ];

        // Statistiques par statut
        const byStatus = [
            {
                name: "En attente",
                value: requests.filter((r) => r.Statut === "SoumisePayee").length,
                color: "hsl(var(--warning))",
            },
            {
                name: "En traitement",
                value: requests.filter((r) => r.Statut === "EnTraitement").length,
                color: "hsl(var(--info))",
            },
            {
                name: "Validées",
                value: requests.filter((r) => r.Statut === "Validée").length,
                color: "hsl(var(--success))",
            },
            {
                name: "Refusées",
                value: requests.filter((r) => r.Statut === "Refusée").length,
                color: "hsl(var(--destructive))",
            },
        ];

        // Statistiques temporelles (par mois)
        const byMonth: Record<string, Record<string, number>> = {};

        requests.forEach((req) => {
            const date = new Date(req.DateDemande);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

            if (!byMonth[monthYear]) {
                byMonth[monthYear] = {
                    naissance: 0,
                    mariage: 0,
                    deces: 0,
                    total: 0,
                };
            }

            byMonth[monthYear][req.TypeActe]++;
            byMonth[monthYear].total++;
        });

        const timeData = Object.entries(byMonth).map(([month, data]) => ({
            month,
            ...data,
        }));

        timeData.sort((a, b) => {
            const [aMonth, aYear] = a.month.split("/").map(Number);
            const [bMonth, bYear] = b.month.split("/").map(Number);

            if (aYear !== bYear) return aYear - bYear;
            return aMonth - bMonth;
        });

        return { byType, byStatus, timeData };
    };

    const chartData = getChartData();

    // Formatage des données pour l'affichage
    const formatPercentage = (value: number) => {
        return value === 0
            ? "0%"
            : `${((value / requests.length) * 100).toFixed(1)}%`;
    };

    // Gestionnaire pour le survol des éléments du graphique
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index,
        name,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return percent > 0 ? (
            <text
                x={x}
                y={y}
                fill="hsl(var(--chart-label))"
                textAnchor="middle"
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-w-0 space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>

            {requests.length === 0 ? (
                <Card>
                    <CardContent className="p-6 sm:p-8 text-center">
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            Aucune donnée disponible
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto mb-4">
                            Il n'y a pas encore de demandes enregistrées dans le
                            système. Les statistiques seront disponibles une
                            fois que des demandes auront été soumises.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Statistiques de base */}
                    <section
                        aria-label="Indicateurs"
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                    >
                        <Card className="gap-0 py-0">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="text-sm font-medium leading-tight text-muted-foreground mb-2">
                                    Total des demandes
                                </h3>
                                <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                                    {requests.length}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="text-sm font-medium leading-tight text-muted-foreground mb-2">
                                    Naissances
                                </h3>
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                                        {chartData.byType[0].value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatPercentage(
                                            chartData.byType[0].value
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="text-sm font-medium leading-tight text-muted-foreground mb-2">
                                    Mariages
                                </h3>
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                                        {chartData.byType[1].value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatPercentage(
                                            chartData.byType[1].value
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardContent className="p-4 sm:p-6">
                                <h3 className="text-sm font-medium leading-tight text-muted-foreground mb-2">
                                    Décès
                                </h3>
                                <div className="flex flex-wrap items-baseline gap-x-2">
                                    <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                                        {chartData.byType[2].value}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatPercentage(
                                            chartData.byType[2].value
                                        )}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Graphiques détaillés */}
                    <Tabs defaultValue="type" className="min-w-0 gap-4">
                        <TabsList className="grid h-auto w-full grid-cols-3">
                            <TabsTrigger value="type" className="min-h-11 whitespace-normal leading-tight">
                                Par type
                            </TabsTrigger>
                            <TabsTrigger value="status" className="min-h-11 whitespace-normal leading-tight">
                                Par statut
                            </TabsTrigger>
                            <TabsTrigger value="time" className="min-h-11 whitespace-normal leading-tight">
                                Évolution temporelle
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="type">
                            <Card className="min-w-0">
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle>
                                        Répartition par type de document
                                    </CardTitle>
                                    <CardDescription>
                                        Distribution des demandes selon le type
                                        d'acte d'état civil
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-2 sm:px-6">
                                    <div className="h-80 sm:h-96">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={chartData.byType}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={
                                                        renderCustomizedLabel
                                                    }
                                                    outerRadius="80%"
                                                    innerRadius="40%"
                                                    fill="hsl(var(--chart-1))"
                                                    stroke="hsl(var(--card))"
                                                    dataKey="value"
                                                >
                                                    {chartData.byType.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Pie>
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Legend
                                                    layout="horizontal"
                                                    verticalAlign="bottom"
                                                    align="center"
                                                    wrapperStyle={{ fontSize: 13 }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="status">
                            <Card className="min-w-0">
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle>
                                        Répartition par statut
                                    </CardTitle>
                                    <CardDescription>
                                        Distribution des demandes selon leur
                                        statut de traitement
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-2 sm:px-6">
                                    <div className="h-80 sm:h-96">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={chartData.byStatus}
                                                margin={chartMargin}
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
                                                    {chartData.byStatus.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                            />
                                                        )
                                                    )}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="time">
                            <Card className="min-w-0">
                                <CardHeader className="px-4 sm:px-6">
                                    <CardTitle>Évolution temporelle</CardTitle>
                                    <CardDescription>
                                        Évolution du nombre de demandes au fil
                                        du temps
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="px-2 sm:px-6">
                                    <div className="h-80 sm:h-96">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <LineChart
                                                data={chartData.timeData}
                                                margin={chartMargin}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                <XAxis
                                                    dataKey="month"
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
                                                <Tooltip contentStyle={tooltipStyle} />
                                                <Legend wrapperStyle={{ fontSize: 13 }} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="total"
                                                    name="Total"
                                                    stroke="hsl(var(--foreground))"
                                                    activeDot={{ r: 8 }}
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="naissance"
                                                    name="Naissance"
                                                    stroke="hsl(var(--chart-1))"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="mariage"
                                                    name="Mariage"
                                                    stroke="hsl(var(--chart-2))"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="deces"
                                                    name="Décès"
                                                    stroke="hsl(var(--chart-5))"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default Page;
