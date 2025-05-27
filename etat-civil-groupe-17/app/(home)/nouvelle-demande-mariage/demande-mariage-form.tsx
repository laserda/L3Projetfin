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
import { Separator } from "@/components/ui/separator";

import { createMarigeDemande } from "@/server/demande/demande";
import { mariageSchema, DemandeMariageFormData, QuiDemande } from "@/validation/validation-demande";
import { Info } from "lucide-react";
import { DemandePourTier, TypeActe } from "@/lib/generated/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorsMessage } from "@/enums/errors-message";
import { getTarifByType } from "@/server/admin/tarif/tarif";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DemandeMariageForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [err, setErr] = useState<string | undefined>("");
    const [isLoading, setIsLoading] = useState(false);
    const [demandePourTier, setDemandePourTier] = useState<QuiDemande>(QuiDemande.LeMari);

    const typeFromUrl = searchParams.get("type") as TypeActe;
    const [montant, setMontant] = useState(0);

    const form = useForm({
        resolver: zodResolver(mariageSchema),
        defaultValues: {
            TypeActe: TypeActe.Mariage,
            DemandePourTier: demandePourTier,
        },
    });

    const getTarif = async (typeActe: TypeActe) => {
        const tarif = await getTarifByType(typeActe);
        console.log(tarif);
        if (tarif) {
            setMontant(tarif.PrixTimbre);

        } else {
            setErr("Le tarif n'est pas encore parametrer pour ce type d'acte");
        }
    }


    useEffect(() => {
        if (typeFromUrl) {
            form.setValue("TypeActe", typeFromUrl);
            getTarif(typeFromUrl);
        }
    }, [typeFromUrl, form]);

    const onSubmit = async (data: DemandeMariageFormData) => {
        try {

            setIsLoading(true)
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const newRequest = await createMarigeDemande(formData);

            if (!newRequest.success) {
                setErr(newRequest.error);
                setIsLoading(false)
                return
            }

            router.push(`/paiement/${newRequest.data}`);
        } catch (error) {
            console.error("Erreur lors de la soumission:", error);
            toast.error("Erreur lors de l'envoi de la demande", {
                description: error as string,
            });
            setIsLoading(false)
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Demande d'acte de mariage</CardTitle>
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
                            {err && (
                                <Alert
                                    variant="destructive"
                                    className="flex items-center border-red-500"
                                >
                                    <Info className="h-4 w-4" color="red" />
                                    <div>
                                        <AlertTitle>Erreur</AlertTitle>
                                        <AlertDescription>{err}</AlertDescription>
                                    </div>
                                </Alert>
                            )}



                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Informations de l'acte</h3>

                                <FormField
                                    control={form.control}
                                    name="DemandePourTier"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Qui fait la demande ?</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value) => {
                                                        setDemandePourTier(value as QuiDemande);
                                                        field.onChange(value);
                                                    }}
                                                    defaultValue={QuiDemande.LeMari}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionnez qui fait la demande" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={QuiDemande.LeMari}>
                                                            {QuiDemande.LeMari}
                                                        </SelectItem>
                                                        <SelectItem value={QuiDemande.LaFemme}>
                                                            {QuiDemande.LaFemme}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
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
                                                <FormLabel>Numéro de l'acte de mariage</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Numéro de l'acte de mariage"
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
                                                <FormLabel>Date du mariage</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {demandePourTier == QuiDemande.LaFemme && <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Epoux</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="NomEpoux"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nom</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nom"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="PrenomEpoux"
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
                                        />

                                        <FormField
                                            control={form.control}
                                            name="DateNaissanceEpoux"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date de naissance</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* <FormField
                                        control={form.control}
                                        name="ProfessionPere"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profession</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Profession"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}
                                    </div>
                                </div>

                            </>}

                            {demandePourTier == QuiDemande.LeMari && <>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Epouse</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="NomEpouse"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nom</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nom"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="PrenomEpouse"
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
                                        />

                                        <FormField
                                            control={form.control}
                                            name="DateNaissanceEpouse"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date de naissance</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="date"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* 
                                    <FormField
                                        control={form.control}
                                        name="ProfessionMere"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Profession</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Profession"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    /> */}
                                    </div>
                                </div>
                            </>}

                            <div className="border-t pt-4">
                                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        Frais de timbre
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Les frais de timbre s'élèvent à {montant} FCFA pour ce document.
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
                                    isLoading={isLoading}
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

export default DemandeMariageForm;
