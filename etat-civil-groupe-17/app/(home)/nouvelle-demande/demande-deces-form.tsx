"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
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

import { createDemande } from "@/server/demande/demande";
import { createDemandeMariageSchema, CreateDemandeMariageFormData } from "@/validation/validation-demande";
import { TypeActe } from "@/lib/generated/prisma";
import { ErrorsMessage } from "@/enums/errors-message";

const DemandeDecesForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [err, setErr] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const typeFromUrl = searchParams.get("type") as TypeActe;

    const form = useForm({
        resolver: zodResolver(createDemandeMariageSchema),
        defaultValues: {
            TypeActe: TypeActe.Décès,
        },
    });

    useEffect(() => {
        if (typeFromUrl) {
            form.setValue("TypeActe", typeFromUrl);
        }
    }, [typeFromUrl, form]);

    const onSubmit = async (data: CreateDemandeMariageFormData) => {
        try {
            setIsLoading(true)
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const newRequest = await createDemande(formData);

            if (!newRequest.success) {
                setErr(ErrorsMessage.errors);
                return
            }

            router.push(`/paiement/${newRequest.ID_Demande}`);
            setIsLoading(false)
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
            toast.error("Erreur lors de l'envoi de la demande", {
                description: "Veuillez réessayer plus tard.",
            });
        }

    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Demande d'acte de décès</CardTitle>
                    <CardDescription>
                        Remplissez ce formulaire pour demander votre document
                        officiel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="NumeroActe"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro de l'acte du décès</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Numéro de l'acte du décès"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="DateActe"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de décès</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Date du mariage"
                                                    {...field}
                                                    type="date"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="Nom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom du defunt</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nom du defunt"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="Prenom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prenom du defunt</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nom du defunt"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>


                            <div className="border-t pt-4">
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        Frais de timbre
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Les frais de timbre s'élèvent à 1000
                                        FCFA pour ce document.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Vous devez régler ces frais pour que
                                        votre demande soit traitée.
                                    </p>
                                </div>

                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    Soumettre ma demande
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default DemandeDecesForm;
