import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
                            className="border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="mb-4 p-3 bg-accent rounded-2xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground mb-4">
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

        </>
    );
}

export default NosServiceLayout;
