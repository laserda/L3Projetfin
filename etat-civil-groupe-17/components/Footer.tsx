import { FC } from "react";
import { Logo } from "./Logo";

export const Footer: FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/40 border-t border-border mt-8">
            {/* Bandeau aux couleurs du drapeau */}
            <div data-slot="bandeau-drapeau" aria-hidden="true" className="flex h-1">
                <span className="flex-1 bg-brand-orange" />
                <span className="flex-1 bg-brand-white" />
                <span className="flex-1 bg-brand-green" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                    <div className="flex justify-center md:justify-start">
                        <Logo size="small" />
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-sm text-muted-foreground">
                            &copy; {currentYear} État Civil CI - République de
                            Côte d'Ivoire
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tous droits réservés
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
