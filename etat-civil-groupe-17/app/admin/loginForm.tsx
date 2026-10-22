"use client";

import { Button } from "@/components/ui/button";
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
import { Info } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginFormData, loginSchema } from "@/validation/validation-agent";
import { login } from "@/server/auth/agent";
import { useRouter } from "next/navigation";
import { ErrorsMessage } from "@/enums/errors-message";

type LoginFormProps = {
    // Page du tableau de bord à ouvrir après connexion
    redirectTo?: string;
    // Affiche une confirmation quand on arrive juste après une inscription
    justRegistered?: boolean;
};

function LoginForm({ redirectTo = "/admin/dashboard", justRegistered = false }: LoginFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [err, setErr] = useState<string | undefined>("");

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            Email: "",
            Password: "",
        },
    });
    const onSubmit = async (data: LoginFormData) => {
        setErr("");
        setIsPending(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        try {
            const res = await login(formData);

            if (!res.success) {
                // Erreur liée à un champ : affichée sous ce champ
                if (res.field === "Email" || res.field === "Password") {
                    form.setError(res.field, { type: "server", message: res.error });
                } else {
                    setErr(res.error ?? ErrorsMessage.errors);
                }
                setIsPending(false);
            } else {
                router.push(redirectTo);
            }
        } catch {
            setErr(ErrorsMessage.errors);
            setIsPending(false);
        }

    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {justRegistered && !err && (
                    <Alert className="flex items-center border-success" role="status">
                        <Info className="h-4 w-4 text-success" />
                        <div>
                            <AlertTitle>Compte créé</AlertTitle>
                            <AlertDescription>
                                Votre compte a bien été créé. Connectez-vous pour accéder au tableau de bord.
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

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

                <FormField
                    control={form.control}
                    name="Email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                    type="email"
                                    placeholder="exemple@email.com"
                                    {...field}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Pour recevoir les notifications concernant votre demande.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="Password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                    type="password"
                                    placeholder="********"
                                    {...field}
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormDescription>
                                Minimum 8 caractères, au moins un chiffre et une majuscule.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    size="lg"
                    className="h-11 w-full text-base md:h-10 md:text-sm"
                    isLoading={isPending}
                >
                    Se connecter
                </Button>
            </form>
        </Form>
    );
}

export default LoginForm;
