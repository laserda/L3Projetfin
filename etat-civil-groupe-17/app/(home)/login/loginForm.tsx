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
import { LoginFormData, loginSchema } from "@/validation/validation-citoyen";
import { login } from "@/server/auth/citoyen";
import { useRouter } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [err, setErr] = useState<string | undefined>("");

    const form = useForm({
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
            console.log(res)
            if (!res.success) {
                const errMessage = res?.error?.toString();
                setErr(errMessage);
                setIsPending(false);
            } else {
                router.push("/");
            }

        } catch (error: any) {
            console.log(error)
            setErr(error.errors);
            setIsPending(false);
            return;
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
                    {isPending ? "En cours de connexion" : "Se connecter"}
                </Button>
            </form>
        </Form>
    );
}

export default LoginForm;
