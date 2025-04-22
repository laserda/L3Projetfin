"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";
import { loginFormSchema, LoginFormValues } from "@/validation";

import { authClient } from "@/lib/auth-client";

const Page = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    // const router = useRouter();

    // const session = useSession();

    // useEffect(() => {
    //     if (session?.data?.user) {
    //         // red("/dashboard");
    //     }
    // }, [session]);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        const { email, password } = values;

        try {
            const { data, error } = await authClient.signIn.email(
                {
                    email,
                    password,
                    callbackURL: "/dashboard",
                },
                {
                    onRequest: () => {
                        setIsLoading(true);
                    },
                    onSuccess: () => {
                        toast.success("Connexion réussie");
                        form.reset();
                        // router.push("/dashboard");
                    },
                    onError: (ctx) => {
                        console.error(ctx.error);

                        toast.error("Erreur de connexion");
                    },
                }
            );
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setLoginError(
                "Identifiants invalides. Utilisez admin@exemple.com avec n'importe quel mot de passe pour la démo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" />
                    </div>
                    <CardTitle className="text-2xl text-center">
                        Connexion
                    </CardTitle>
                    <CardDescription className="text-center">
                        Espace réservé aux agents de l'administration
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {loginError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erreur de connexion</AlertTitle>
                            <AlertDescription>{loginError}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="admin@admin.com"
                                                type="email"
                                                autoComplete="email"
                                                disabled={isLoading}
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
                                            <div className="relative">
                                                <Input
                                                    placeholder="••••••••"
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    autoComplete="current-password"
                                                    disabled={isLoading}
                                                    {...field}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4 text-gray-500" />
                                                    ) : (
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                    )}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-ci-green hover:bg-ci-green/90"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? "Connexion en cours..."
                                    : "Se connecter"}
                            </Button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                Pour la démo, utilisez{" "}
                                <strong>admin@admin.com</strong> comme email et{" "}
                                <strong>password</strong> comme mot de passe.
                            </p>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Button
                        variant="link"
                        className="text-gray-500"
                        onClick={() => {}}
                    >
                        Retour à l'accueil
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Page;
