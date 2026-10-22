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

import {
    registerSchema,
    RegisterFormData,
} from "@/validation/validation-citoyen";
import { register } from "@/server/auth/citoyen";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

function RegisterForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [err, setErr] = useState<string | undefined>("");

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            Nom: "",
            Prenom: "",
            DateNaissance: "",
            LieuNaissance: "",
            Telephone: "",
            Adresse: "",
            Email: "",
            Password: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsPending(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        // Un try catch serai plus simple
        try {
            const res = await register(formData);

            if (!res.success) {
                const errMessage = res.error;
                setErr(errMessage);
                setIsPending(false);
            } else {
                router.push("/");
            }
        } catch (error) {
            // const errMessage = Object.values(res?.errors ?? {})[0]?.toString();
            setErr(error as string);
            setIsPending(false);
        }

    };

    return (
        <Form {...form}>
            <form
                noValidate
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="Nom"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                        placeholder="Nom de famille"
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
                        name="Prenom"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-11 text-base md:h-10 md:text-sm"
                                        placeholder="Prénom"
                                        {...field}
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="DateNaissance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date de naissance</FormLabel>
                                <FormControl>
                                    <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                        placeholder="date de naissance"
                                        {...field}
                                        type="date"
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="LieuNaissance"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lieu de naissance</FormLabel>
                                <FormControl>
                                    <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                        placeholder="Lieu de naissance"
                                        {...field}
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="Telephone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                    placeholder="+225 00 00 00 00"
                                    type="tel"
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
                    name="Adresse"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                                <Input
                                    className="h-11 text-base md:h-10 md:text-sm"
                                    placeholder="Adresse complète"
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
                    Créer mon compte
                </Button>
            </form>
        </Form>
    );
}

export default RegisterForm;
