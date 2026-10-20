"use client";
import { Button, buttonVariants } from "@/components/ui/button";
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
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { ReactNode, useState } from "react";
import { FieldValues, UseFormReturn, Path } from "react-hook-form";

// Structure commune des formulaires de demande d'acte (naissance, mariage, décès) :
// cadre, sections, champs et bouton d'envoi, pensés d'abord pour le téléphone (360 px).

// Cadre de la page de demande : titre, description puis le formulaire
export function DemandeFormLayout({
    title,
    description,
    children,
}: {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div data-slot="demande-form" className="w-full max-w-3xl mx-auto">
            <Card className="gap-4 py-5 sm:gap-6 sm:py-6">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
                    {description && (
                        <CardDescription className="text-base sm:text-sm">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent className="px-4 sm:px-6">{children}</CardContent>
            </Card>
        </div>
    );
}

// Groupe de champs : une colonne sur téléphone, deux à partir des tablettes
export function DemandeFormSection({
    title,
    children,
    className,
}: {
    title?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            data-slot="demande-section"
            className={cn("space-y-4 rounded-lg border p-4 sm:p-5", className)}
        >
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-4 [&>*]:min-w-0">
                {children}
            </div>
        </section>
    );
}

// Bouton d'envoi : pleine largeur et facile à toucher sur téléphone
export function DemandeFormActions({
    label,
    isLoading,
}: {
    label: ReactNode;
    isLoading: boolean;
}) {
    return (
        <div data-slot="demande-actions" className="flex flex-col sm:flex-row sm:justify-end">
            <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="h-12 w-full text-base sm:w-auto sm:min-w-56"
            >
                {label}
            </Button>
        </div>
    );
}

// Champs de saisie (44 px de haut, texte de 16 px : pas de zoom automatique sur téléphone)
export const demandeChampClassName = "h-11 text-base md:text-base";
// Liste déroulante (déclencheur) et ses entrées ; un texte trop long est coupé (…)
// pour que la flèche reste visible sur téléphone
export const demandeSelectTriggerClassName =
    "w-full min-w-0 data-[size=default]:h-11 text-base [&>[data-slot=select-value]]:block [&>[data-slot=select-value]]:min-w-0 [&>[data-slot=select-value]]:truncate";
export const demandeSelectItemClassName = "min-h-11 text-base";

function CustomForm<T extends FieldValues>({
    Passedform,
    submit,
    isLoading,
    authType,
}: {
    Passedform: UseFormReturn<T>;
    submit: (values: T) => void | Promise<void>;
    isLoading: boolean;
    authType: "login" | "register";
}) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Form {...Passedform}>
            <form
                onSubmit={Passedform.handleSubmit(submit, (errors) => {
                    console.error("Form validation errors", errors);
                })}
                className="space-y-4"
            >
                {authType === "register" && (
                    <>
                        <FormField
                            control={Passedform.control}
                            name={"name" as Path<T>}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            placeholder="Votre nom"
                                            autoComplete="name"
                                            disabled={isLoading}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="hidden">
                            <FormField
                                control={Passedform.control}
                                name={"role" as Path<T>}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="hidden"
                                                disabled={isLoading}
                                                {...field}
                                                // value="agent"
                                                defaultValue={"agent"}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </>
                )}

                <FormField
                    control={Passedform.control}
                    name={"email" as Path<T>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="exemple@email.com"
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
                    control={Passedform.control}
                    name={"password" as Path<T>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        disabled={isLoading}
                                        {...field}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Input
                    type="submit"
                    className={`${buttonVariants({
                        variant: "secondary",
                    })}`}
                    disabled={isLoading}
                    value={isLoading ? "...." : "Envoyer"}
                />
            </form>
        </Form>
    );
}

export default CustomForm;
