import { FileText, User, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { getUser } from "@/server/user";

const features = [
    {
        title: "Demande d'acte de naissance",
        description:
            "Obtenez une copie de votre acte de naissance facilement et rapidement.",
        icon: <FileText className="h-10 w-10 text-ci-orange" />,
        href: "/nouvelle-demande?type=naissance",
    },
    {
        title: "Demande d'acte de mariage",
        description:
            "Demandez une copie de votre acte de mariage en quelques clics.",
        icon: <FileText className="h-10 w-10 text-ci-orange" />,
        href: "/denouvelle-demande?type=mariage",
    },
    {
        title: "Demande d'acte de décès",
        description: "Obtenez un certificat de décès simplement et rapidement.",
        icon: <FileText className="h-10 w-10 text-ci-orange" />,
        href: "/nouvelle-demande?type=deces",
    },
];

export default async function HomePage() {
    // const session = await getUser();

    return (
        <main className="px-4 md:px-8">
            {/* Hero */}
            <section className="py-12 md:py-16 text-center bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-sm border mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                    Service d'État Civil{" "}
                    <span className="text-ci-orange">Numérique</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
                    Demandez vos actes d'état civil en ligne, suivez vos
                    demandes et recevez vos documents sans vous déplacer.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/nouvelle-demande">
                        <Button
                            size="lg"
                            className="bg-ci-orange hover:bg-ci-orange/90"
                        >
                            <FileText className="mr-2 h-5 w-5" />
                            Nouvelle demande
                        </Button>
                    </Link>
                    <Link href="/suivi-demande">
                        <Button size="lg" variant="outline">
                            <Search className="mr-2 h-5 w-5" />
                            Suivre ma demande
                        </Button>
                    </Link>
                    {/* {session && session.user.role !== "user" && (
                        <Link href="/dashboard">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="bg-ci-green hover:bg-ci-green/90 text-white"
                            >
                                <User className="mr-2 h-5 w-5" />
                                Espace administration
                            </Button>
                        </Link>
                    )} */}
                </div>
            </section>

            {/* Services */}
            <section className="py-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Nos services
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="border border-gray-200 hover:border-ci-orange/50 transition-all duration-300 hover:shadow-md"
                        >
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="mb-4 p-3 bg-gray-50 rounded-full">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {feature.description}
                                </p>
                                <Link href={feature.href}>
                                    <Button className="mt-auto">
                                        Faire une demande
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Processus */}
            <section className="py-12 mt-8 bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-10 text-center text-gray-800">
                    Comment ça marche ?
                </h2>
                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        {
                            step: 1,
                            title: "Remplir le formulaire",
                            description:
                                "Complétez le formulaire de demande en ligne avec vos informations personnelles.",
                        },
                        {
                            step: 2,
                            title: "Payer les frais",
                            description:
                                "Réglez les frais de timbre de 1000 FCFA pour votre demande.",
                        },
                        {
                            step: 3,
                            title: "Traitement",
                            description:
                                "Notre équipe traite votre demande dans un délai de 24 à 48 heures.",
                        },
                        {
                            step: 4,
                            title: "Réception",
                            description:
                                "Recevez votre document par email ou venez le récupérer en mairie.",
                        },
                    ].map((item) => (
                        <div key={item.step} className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-ci-orange text-white rounded-full font-bold text-lg mb-4">
                                {item.step}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                {item.title}
                            </h3>
                            <p className="text-gray-600">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
