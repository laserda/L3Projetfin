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
// import { useFormState } from "react";
import { useActionState, useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoginFormData, loginSchema } from "@/validation/validation-agent";
import { login } from "@/server/auth/agent";
import { redirect } from "next/navigation";

function LoginForm() {
    const [state, formAction] = useActionState(login, undefined);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (state?.redirectTo) {
            redirect(state.redirectTo);
        }
    }, [state]);

    return (
        <Form {...form}>
            <form action={formAction} className="space-y-6">
                {state?.errors && (
                    <Alert
                        variant="destructive"
                        className="flex items-center border-red-500"
                    >
                        <Info className="h-4 w-4" color="red" />
                        <div>
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>
                                {Object.values(state.errors)[0]}
                            </AlertDescription>
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

                <Button type="submit" className="w-full">
                    Se connecter
                </Button>
            </form>
        </Form>
    );
}

export default LoginForm;
