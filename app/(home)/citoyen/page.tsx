"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
    emailFormSchema,
    EmailFormValues,
    suiviFormSchema,
    SuiviFormValues,
} from "@/validation";
import { formatDate, getRequestTypeName } from "@/utils";

const Citoyen = () => {
    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Liste de vos demandes</CardTitle>
                    <CardDescription>
                        Consultez la liste de vos demandes
                    </CardDescription>
                </CardHeader>

                <CardContent></CardContent>

                <CardFooter></CardFooter>
            </Card>
        </div>
    );
};

export default Citoyen;
