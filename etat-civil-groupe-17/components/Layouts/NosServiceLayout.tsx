import { FileText } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TypeActe } from "@/lib/generated/prisma";



const features = [
    {
        title: "Demande d'acte de naissance",
        description:
            "Obtenez une copie de votre acte de naissance facilement et rapidement.",
        icon: <FileText className="h-10 w-10 text-primary" />,
        href: `/nouvelle-demande-naissance?type=${TypeActe.Naissance}`,
    },
    {
        title: "Demande d'acte de mariage",
        description:
            "Demandez une copie de votre acte de mariage en quelques clics.",
        icon: <FileText className="h-10 w-10 text-primary" />,
        href: `/nouvelle-demande-mariage?type=${TypeActe.Mariage}`,
    },
    {
        title: "Demande d'acte de décès",
        description: "Obtenez un certificat de décès simplement et rapidement.",
        icon: <FileText className="h-10 w-10 text-primary" />,
        href: `/nouvelle-demande-deces?type=${TypeActe.Décès}`,
    },
];
function NosServiceLayout() {
    return (
        <>
            <section className="py-8" id="nos-service">
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                    Nos services
                </h2>
                <div className="grid md:grid-cols-3 gap-6">

                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="h-full rounded-xl border-t-4 border-t-primary shadow-lg transition-all duration-300 hover:border-primary/50 hover:border-t-primary hover:-translate-y-0.5"
                        >
                            <CardContent className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
                                <div className="mb-4 p-3 bg-accent rounded-2xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {feature.description}
                                </p>
                                {/* Lien présenté comme un bouton (pas de bouton dans un lien), cible tactile de 44 px sur téléphone */}
                                <Link
                                    href={feature.href}
                                    className={cn(buttonVariants(), "mt-auto h-11 w-full text-base sm:w-auto md:h-9 md:text-sm")}
                                >
                                    Faire une demande
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

        </>
    );
}

export default NosServiceLayout;
