import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import RegisterForm from "./registerForm";

const Page = () => {
    return (
        <div className="flex justify-center items-center min-h-screen px-4 py-8">
            <Card className="w-full max-w-md rounded-xl border-t-4 border-t-primary shadow-lg sm:min-w-[425px]">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
                    <CardDescription className="text-center">
                        Espace reservé aux agents
                    </CardDescription>
                </CardHeader>

                <CardContent><RegisterForm /></CardContent>

                <CardFooter className="flex justify-center border-t pt-4">
                    <Link href={"/admin"} className="py-2 text-sm font-medium text-primary hover:underline">
                        Déjà inscrit ? Connexion
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Page;
