import { FileText, User, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import NosServiceLayout from "@/components/Layouts/NosServiceLayout";
// import { getUser } from "@/server/user";


export default async function HomePage() {
    // const session = await getUser();

    return (
        <main className="px-4 md:px-8">
            {/* Hero */}
            <section className="relative overflow-hidden py-12 md:py-16 px-4 text-center bg-gradient-to-br from-accent via-card to-secondary/10 rounded-2xl shadow-md border mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-foreground text-balance">
                    Service d'État Civil{" "}
                    <span className="text-primary">Numérique</span>
                </h1>
                <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed">
                    Demandez vos actes d'état civil en ligne, suivez vos
                    demandes et recevez vos documents sans vous déplacer.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="#nos-service">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90"
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
                                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                            >
                                <User className="mr-2 h-5 w-5" />
                                Espace administration
                            </Button>
                        </Link>
                    )} */}
                </div>
            </section>

            {/* Services */}
            <NosServiceLayout />

            {/* Processus */}
            <section className="py-12 mt-8 bg-card border shadow-sm rounded-2xl px-4 sm:p-8">
                <h2 className="text-2xl font-bold mb-10 text-center text-foreground">
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
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary text-primary-foreground rounded-full font-bold text-lg mb-4 shadow-md ring-4 ring-primary/15">
                                {item.step}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-foreground">
                                {item.title}
                            </h3>
                            <p className="text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
