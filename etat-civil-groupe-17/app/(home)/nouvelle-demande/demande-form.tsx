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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { getRequestTypeName } from "@/utils";
import { RequestType } from "@/types";
import { createDemande } from "@/server/demande/demande";
import { createDemandeSchema, CreateDemandeFormData } from "@/validation/validation-demande";
import { CalendarIcon } from "lucide-react";
import { TypeActe } from "@/lib/generated/prisma";

const DemandeForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const typeFromUrl = searchParams.get("type") as TypeActe;

    const form = useForm({
        resolver: zodResolver(createDemandeSchema),
        defaultValues: {
            TypeActe: typeFromUrl ,
        },
    });

    useEffect(() => {
        if (typeFromUrl) {
            form.setValue("TypeActe", typeFromUrl);
        }
    }, [typeFromUrl, form]);

    const onSubmit = async (data: CreateDemandeFormData) => {
        try {

            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            var res = await createDemande(formData);
            // const requests = JSON.parse(
            //     localStorage.getItem("requests") || "[]"
            // );
            // const newRequest = {
            //     id: crypto.randomUUID(),
            //     ...data,
            //     statut: "pending",
            //     created_at: new Date().toISOString(),
            // };
            // requests.push(newRequest);
            // localStorage.setItem("requests", JSON.stringify(requests));

            // console.log(
            //     `Email envoyé à ${data.email} pour confirmer la demande d'acte ${data.type}`
            // );

            // toast.success("Demande envoyée avec succès !", {
            //     description: "Vous recevrez un email de confirmation sous peu.",
            // });

            // router.push(`/confirmation/${newRequest.id}`);
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
            toast.error("Erreur lors de l'envoi de la demande", {
                description: "Veuillez réessayer plus tard.",
            });
        }
    };

    const getFormTitle = () => {
        const type = form.watch("TypeActe");
        switch (type) {
            case "Naissance":
                return "Demande d'acte de naissance";
            case "Mariage":
                return "Demande d'acte de mariage";
            case "Décès":
                return "Demande d'acte de décès";
            default:
                return "Nouvelle demande";
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{getFormTitle()}</CardTitle>
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
                            <FormField
                                control={form.control}
                                name="TypeActe"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type de document</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionnez un type de document" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(TypeActe).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {getRequestTypeName(type)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="NumeroActe"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numéro d'acte</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Numéro d'acte"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={form.control}
                                    name="prenom"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Prénom"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}
                            </div>

                            {/*<FormField
                                control={form.control}
                                name="parents"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parents</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Noms et prénoms des parents"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Pour les actes de naissance,
                                            indiquez les noms des parents. Pour
                                            les actes de mariage, indiquez le
                                            nom du conjoint.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`"w-[240px] pl-3 text-left font-normal",
                                                            ${!field.value && "text-muted-foreground"}`}
                                                        >
                                                            {field.value ? (
                                                                <span>
                                                                    {new Date(
                                                                        field.value
                                                                    ).toLocaleDateString(
                                                                        "fr-FR"
                                                                    )}
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    Date de
                                                                    naissance,
                                                                    mariage ou
                                                                    décès
                                                                </span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={
                                                            new Date(
                                                                field.value
                                                            )
                                                        }
                                                        onSelect={
                                                            field.onChange
                                                        }
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date <
                                                                new Date(
                                                                    "1900-01-01"
                                                                )
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lieu"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lieu</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Lieu de naissance, mariage ou décès"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Votre adresse email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Pour recevoir les notifications
                                            concernant votre demande
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />*/}

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
{/* 
                                <FormField
                                    control={form.control}
                                    name="paymentConfirmed"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Je confirme avoir payé les
                                                    frais de timbre de 1000 FCFA
                                                </FormLabel>
                                                <FormDescription>
                                                    En cochant cette case, vous
                                                    confirmez avoir effectué le
                                                    paiement.
                                                </FormDescription>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                /> */}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-ci-orange hover:bg-ci-orange/90"
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

export default DemandeForm;
