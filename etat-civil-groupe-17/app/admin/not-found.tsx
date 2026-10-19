import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary">404</h1>
                <h2 className="mt-4 text-3xl font-bold text-foreground">
                    Page introuvable
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                    Désolé, nous n'avons pas pu trouver la page que vous
                    recherchez.
                </p>
                <div className="mt-6">
                    <Link
                        href="/"
                        className={`${buttonVariants()} bg-primary hover:bg-primary/90`}
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
