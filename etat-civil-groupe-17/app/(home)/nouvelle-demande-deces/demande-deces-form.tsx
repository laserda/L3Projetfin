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
} from "@/components/CustomForm";

import { createDecesDemande } from "@/server/demande/demande";
import { decesSchema, DemandeDecesFormData } from "@/validation/validation-demande";
import { TypeActe } from "@/lib/generated/prisma";
import { getTarifByType } from "@/server/admin/tarif/tarif";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const DemandeDecesForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [err, setErr] = useState<string | undefined>("");
    const [isLoading, setIsLoading] = useState(false);
    const [montant, setMontant] = useState(0);

    const typeFromUrl = searchParams.get("type") as TypeActe;

    const form = useForm({
        resolver: zodResolver(decesSchema),
        defaultValues: {
            TypeActe: TypeActe.Décès,
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

    const onSubmit = async (data: DemandeDecesFormData) => {
        try {
            setIsLoading(true)
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const newRequest = await createDecesDemande(formData);

            if (!newRequest.success) {
                setErr(newRequest.error);
                setIsLoading(false)
                return
            }

            router.push(`/paiement/${newRequest.data}`);
        } catch (error) {
            toast.error("Erreur lors de l'envoi de la demande", {
                description: error as string,
            });
            setIsLoading(false)
        }

    };

    return (
        <DemandeFormLayout
            title="Demande d'acte de décès"
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
                            name="NumeroActe"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Numéro de l'acte du décès</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
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
                                            className={demandeChampClassName}
                                            placeholder="Date du décès"
                                            {...field}
                                            type="date"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="Nom"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom du défunt</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Nom du défunt"
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
                                    <FormLabel>Prénom du défunt</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Prénom du défunt"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </DemandeFormSection>

                    <DemandeFormSection title="Père du défunt">
                        <FormField
                            control={form.control}
                            name="NomPere"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Nom du père"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="PrenomPere"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Prénom du père"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ProfessionPere"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profession</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Profession du père"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </DemandeFormSection>

                    <DemandeFormSection title="Mère du défunt">
                        <FormField
                            control={form.control}
                            name="NomMere"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Nom de la mère"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="PrenomMere"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Prénom de la mère"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ProfessionMere"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profession</FormLabel>
                                    <FormControl>
                                        <Input
                                            className={demandeChampClassName}
                                            placeholder="Profession de la mère"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </DemandeFormSection>

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

export default DemandeDecesForm;
