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
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    RegisterFormData,
    registerSchema,
} from "@/validation/validation-agent";
import { register } from "@/server/auth/agent";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

function RegisterForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [err, setErr] = useState("");

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            nom: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setErr("");
        setIsPending(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        const res = await register(formData);

        if (res?.errors) {
            const errMessage = Object.values(res?.errors ?? {})[0]?.toString();
            setErr(errMessage);
            setIsPending(false);
            return;
        }
        setIsPending(false);
        router.push("/");
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
                    name="nom"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom et prénom</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Jean Dupont"
                                    {...field}
                                    disabled={isPending}
                                />
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
                                    disabled={isPending}
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
                                    disabled={isPending}
                                />
                            </FormControl>
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

export default RegisterForm;
