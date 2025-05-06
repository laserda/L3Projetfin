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
import { useActionState, useState, useTransition } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginFormData, loginSchema } from "@/validation/validation-citoyen";
import { login } from "@/server/auth/citoyen";

function LoginForm() {
    const [isPending, startTransition] = useTransition();
    const [state, loginAction] = useActionState(login, undefined);
    const [err, setErr] = useState("");
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        startTransition(() => {
            loginAction(formData);
        });
        const errMessage = Object.values(state?.errors ?? {})[0]?.toString();
        setErr(errMessage);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="exemple@email.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Pour recevoir les notifications concernant votre
                                demande.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="********"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Minimum 8 caractères, au moins un chiffre et une
                                majuscule.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "En cours de création" : "Créer mon compte"}
                </Button>
            </form>
        </Form>
    );
}

export default LoginForm;
