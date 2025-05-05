"use client";
import CustomForm from "@/components/CustomForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

import { RegisterFormSchema, RegisterFormValues } from "@/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function AgentForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(RegisterFormSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
        },
    });

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            setIsLoading(true);
            const { data } = await authClient.admin.createUser(
                {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    role: ["agent"],
                },
                {
                    onSuccess: () => {
                        toast.success("Compte créé avec succès");
                        form.reset();
                        setIsOpen(false);
                        setIsLoading(false);
                    },
                    onError: (error) => {
                        toast.error("Erreur lors de l'inscription");
                        console.log(error.error.message, error.error.cause);
                        setIsLoading(false);
                    },
                    onRequest: () => {
                        setIsLoading(true);
                    },
                }
            );
        } catch (error:any) {
            console.error(error);
            toast.error("Erreur lors de l'inscription");
            setLoginError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Ajouter un agent</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter un agent</DialogTitle>
                    {loginError ? (
                        <DialogDescription className=" text-red-600 text-base">
                            {loginError}
                        </DialogDescription>
                    ) : (
                        <DialogDescription>
                            Ajouter un agent pour gérer les demandes.
                        </DialogDescription>
                    )}
                </DialogHeader>
                <CustomForm
                    authType="register"
                    isLoading={isLoading}
                    submit={onSubmit}
                    Passedform={form}
                />
            </DialogContent>
        </Dialog>
    );
}
