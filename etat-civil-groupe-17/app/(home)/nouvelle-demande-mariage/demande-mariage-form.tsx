"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    DemandeFormActions,
    DemandeFormLayout,
    DemandeFormSection,
    demandeChampClassName,
    demandeSelectItemClassName,
    demandeSelectTriggerClassName,
} from "@/components/CustomForm";

import { createMarigeDemande } from "@/server/demande/demande";
import { mariageSchema, DemandeMariageFormData, QuiDemande } from "@/validation/validation-demande";
import { Info } from "lucide-react";
import { TypeActe } from "@/lib/generated/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

    const sectionEpoux = (
        <DemandeFormSection title="Epoux">
            <FormField
                control={form.control}
                name="NomEpoux"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                            <Input
                                className={demandeChampClassName}
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
                                className={demandeChampClassName}
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
                                className={demandeChampClassName}
                                type="date"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </DemandeFormSection>
    );

    const sectionEpouse = (
        <DemandeFormSection title="Epouse">
            <FormField
                control={form.control}
                name="NomEpouse"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                            <Input
                                className={demandeChampClassName}
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
                                className={demandeChampClassName}
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
                                className={demandeChampClassName}
                                type="date"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </DemandeFormSection>
    );

    return (
        <DemandeFormLayout
            title="Demande d'acte de mariage"
            description="Remplissez ce formulaire pour demander votre document officiel."
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {err && (
                        <Alert
                            variant="destructive"
                            className="flex items-center border-destructive"
                        >
                            <Info className="h-4 w-4 text-destructive" />
                            <div>
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>{err}</AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <DemandeFormSection>
                        <FormField
                            control={form.control}
                            name="DemandePourTier"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
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
                                                <SelectTrigger className={demandeSelectTriggerClassName}>
                                                    <SelectValue placeholder="Sélectionnez qui fait la demande" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={QuiDemande.LeMari} className={demandeSelectItemClassName}>
                                                    {QuiDemande.LeMari}
                                                </SelectItem>
                                                <SelectItem value={QuiDemande.LaFemme} className={demandeSelectItemClassName}>
                                                    {QuiDemande.LaFemme}
                                                </SelectItem>
                                                <SelectItem value={QuiDemande.Autre} className={demandeSelectItemClassName}>
                                                    {QuiDemande.Autre}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="NumeroActe"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de l'acte de mariage</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
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
                                            className={demandeChampClassName}
                                            type="date"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </DemandeFormSection>

                    {(demandePourTier == QuiDemande.LaFemme || demandePourTier == QuiDemande.Autre) && sectionEpoux}
                    {(demandePourTier == QuiDemande.LeMari || demandePourTier == QuiDemande.Autre) && sectionEpouse}

                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">
                            Frais de timbre
                        </h3>
                        <p className="text-muted-foreground mb-2">
                            Les frais de timbre s'élèvent à {montant} FCFA pour ce document.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Vous devez régler ces frais pour que
                            votre demande soit traitée.
                        </p>
                    </div>

                    <DemandeFormActions
                        label="Soumettre ma demande"
                        isLoading={isLoading}
                    />
                </form>
            </Form>
        </DemandeFormLayout>
    );
};

export default DemandeMariageForm;
