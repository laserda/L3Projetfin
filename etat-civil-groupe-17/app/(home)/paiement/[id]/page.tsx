"use client";
import { ComponentType, FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { DemandeResquest, Request } from "@/types";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, FileText, Info } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDate, formatMontantFCFA, getRequestTypeName, getStatusDemande } from "@/utils";
import { createPaimentDemande, getDemande, getDemandeEnAttenteDePaiement } from "@/server/demande/demande";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaiementFormData, paiementSchema } from "@/validation/validation-paiement";
import { ModePaiement } from "@/lib/generated/prisma";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";
import { ErrorsMessage } from "@/enums/errors-message";
import { useRouter } from "next/navigation";
// react-paystack accède à `window` dès son chargement : on ne le charge que dans le navigateur
// (jamais pendant la préparation de la page par le serveur).
const PaystackConsumer = dynamic(
    () => import("react-paystack").then((mod) => mod.PaystackConsumer),
    {
        ssr: false,
        loading: () => <Button disabled>Payer</Button>,
    }
) as ComponentType<any>;
import { getTarifByType, getTarifs } from "@/server/admin/tarif/tarif";



interface PaystackConfig {
    reference: string;
    email: string;
    amount: number;
    publicKey: string;
}

interface PaystackResponse {
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    message: string;
    [key: string]: any;
}


const PaiementPage: FC = () => {

    const router = useRouter();

    const { id } = useParams<{ id: string }>();
    const [request, setRequest] = useState<DemandeResquest | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [montant, setMontant] = useState(0);
    const [err, setErr] = useState<string | undefined>("");
    const [paiementInterrompu, setPaiementInterrompu] = useState(false);

    const form = useForm({
        resolver: zodResolver(paiementSchema),
        defaultValues: {
            Montant: montant,
            ModePaiement: ModePaiement.Carte_Bancaire,
            Transaction_ID: id
        },
    });

    useEffect(() => {
        if (id) {
            form.setValue("Transaction_ID", id);
            form.setValue("Montant", montant);
        }
    }, [id, form]);


    const config = {
        reference: (new Date()).getTime().toString(),
        email: request?.Citoyen.Email,
        amount: montant * 100, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
        publicKey: process.env.NEXT_PUBLIC_KEY,
        currency: "XOF" // CFA Franc BCEAO
    };

    const handlePaystackSuccessAction = async (reference: any) => {
        // Implementation for whatever you want to do with reference and after success call.

        const paiement = {
            Montant: montant,
            ModePaiement: ModePaiement.Carte_Bancaire,
            Transaction_ID: config.reference,
        };
        const newRequest = await createPaimentDemande(paiement, id);
        if (!newRequest.success) {
            setErr(ErrorsMessage.errors);
            setIsLoading(false);
            return
        }

        router.push(`/confirmation/${newRequest.ID_Demande}`);
    };

    // you can call this function anything
    const handlePaystackCloseAction = () => {
        // implementation for  whatever you want to do when the Paystack dialog closed.
        setIsLoading(false);
        // Paiement annulé ou non abouti : la demande reste en attente de paiement, on l'indique clairement
        setPaiementInterrompu(true);

    }

    const componentProps: any = {
        ...config,
        text: 'Paystack Button Implementation',
        onSuccess: (reference: PaystackResponse) => handlePaystackSuccessAction(reference),
        onClose: handlePaystackCloseAction,
    };



    useEffect(() => {
        const fetchRequest = async () => {
            setLoading(true);
            try {
                const foundRequest = await getDemandeEnAttenteDePaiement(id);
                if (foundRequest) {
                    setRequest(foundRequest);

                    const tarif = await getTarifByType(foundRequest.TypeActe);
                    if (tarif) {
                        setMontant(tarif.PrixTimbre);
                    } else {
                        setErr("Le tarif n'est pas encore parametrer pour ce type d'acte");
                    }
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération de la demande:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [id]);

    if (loading) {
        return (
            <div data-slot="loader" role="status" aria-busy="true" className="flex flex-col gap-4 justify-center items-center min-h-[60vh]">
                <span className="loader-ring h-14 w-14 rounded-full border-4 animate-spin" />
                <div className="animate-pulse text-primary font-medium">
                    Chargement...
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Demande introuvable
                    </CardTitle>
                    <CardDescription>
                        Nous n'avons pas pu trouver votre demande. Veuillez
                        vérifier l'URL ou essayer à nouveau.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/demande">
                        <Button>Faire une nouvelle demande</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }


    return (
        <div className="w-full max-w-3xl mx-auto">
            <Card className="gap-4 py-5 rounded-xl border-t-4 border-t-primary shadow-lg sm:gap-6 sm:py-6">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-xl font-bold sm:text-2xl">Paiement</CardTitle>
                    <CardDescription className="text-base sm:text-sm">
                        Faite le paiement de votre demande {getRequestTypeName(request.TypeActe)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
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

                    {paiementInterrompu && (
                        <Alert
                            className="flex items-start gap-3 border-warning/30 bg-warning/10"
                        >
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                            <div>
                                <AlertTitle className="text-warning">
                                    Paiement non effectué
                                </AlertTitle>
                                <AlertDescription className="text-foreground">
                                    Le paiement a été annulé ou n'a pas abouti. Aucun montant
                                    n'a été validé&nbsp;: votre demande est conservée, en attente de
                                    paiement. Vous pouvez relancer le paiement.
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <div className="rounded-lg border bg-muted p-4 sm:p-5">
                        <h3 className="font-semibold text-foreground mb-2">
                            Frais de timbre
                        </h3>
                        <p className="text-muted-foreground mb-2">
                            Les frais de timbre s'élèvent à{" "}
                            <span className="font-semibold text-foreground">
                                {formatMontantFCFA(montant)}
                            </span>{" "}
                            pour ce document.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Vous devez régler ces frais pour que
                            votre demande soit traitée.
                        </p>
                    </div>

                    <div className="flex sm:justify-end">

                        <PaystackConsumer {...componentProps} >
                            {({ initializePayment }: { initializePayment: (...args: any[]) => void }) => <Button
                                size="lg"
                                className="h-11 w-full text-base sm:w-auto md:h-10 md:text-sm"
                                isLoading={isLoading}
                                onClick={() => {
                                    setPaiementInterrompu(false);
                                    setIsLoading(true);
                                    initializePayment(handlePaystackSuccessAction, handlePaystackCloseAction)
                                }}
                            >
                                Payer
                            </Button>}
                        </PaystackConsumer>
                        {/* <PaystackButtonNoSSR {...componentProps} className="bg-primary hover:bg-primary/90" /> */}

                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PaiementPage;
