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
import LoginForm from "./loginForm";

type PageProps = {
    searchParams: Promise<{ redirect?: string | string[]; inscrit?: string | string[] }>;
};

// N'accepte comme destination après connexion que les pages du tableau de bord
function getRedirectTarget(redirect?: string | string[]) {
    const target = Array.isArray(redirect) ? redirect[0] : redirect;
    if (target && /^\/admin\/dashboard(\/[A-Za-z0-9_\-\/]*)?$/.test(target)) {
        return target;
    }
    return "/admin/dashboard";
}

const Page = async ({ searchParams }: PageProps) => {
    const params = await searchParams;
    const redirectTo = getRedirectTarget(params.redirect);
    const justRegistered = params.inscrit === "1";

    return (
        <div className="flex justify-center items-center min-h-screen px-4 py-6">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Logo size="large" />
                    </div>
                    <CardTitle className="text-2xl text-center">Connexion</CardTitle>
                    <CardDescription className="text-center">
                        Espace reservé aux agents
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <LoginForm redirectTo={redirectTo} justRegistered={justRegistered} />
                </CardContent>

                <CardFooter className="flex justify-center">
                    <Link href={"/admin/register"} className="text-gray-500">
                        Pas encore inscrit ? Inscription
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Page;
