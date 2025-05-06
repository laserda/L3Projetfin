"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState, useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    RegisterFormData,
    registerSchema,
} from "@/validation/validation-agent";
import { register } from "@/server/auth/agent";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";

function RegisterForm() {
    const [state, formAction] = useActionState(register, undefined);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
    });

    useEffect(() => {
        if (state) setIsLoading(false);
        if (state?.redirectTo) {
            redirect(state.redirectTo);
        }
    }, [state]);
    const handleSubmit = (formData: FormData) => {
        setIsLoading(true);
        formAction(formData);
    };

    return (
        <Form {...form}>
            <form action={handleSubmit} className="space-y-6">
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
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom et prénom</FormLabel>
                            <FormControl>
                                <Input placeholder="Jean Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="email@domaine.com"
                                    {...field}
                                />
                            </FormControl>
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">
                    Créer mon compte
                </Button>
            </form>
        </Form>
    );
}

export default RegisterForm;
