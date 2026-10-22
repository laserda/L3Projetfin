import Link from "next/link";
import { Logo } from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";

const NotFound = () => {
    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4 py-8">
            <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground border-t-4 border-t-primary shadow-lg px-6 py-8 text-center">
                <div className="flex justify-center mb-4">
                    <Logo size="large" />
                </div>
                <h1 className="text-7xl font-bold text-primary">404</h1>
                <h2 className="mt-4 text-2xl font-bold text-foreground">
                    Page introuvable
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                    Désolé, nous n'avons pas pu trouver la page que vous
                    recherchez.
                </p>
                <div className="mt-6">
                    <Link
                        href="/admin/dashboard"
                        className={`${buttonVariants({ size: "lg" })} h-11 w-full bg-primary hover:bg-primary/90`}
                    >
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;