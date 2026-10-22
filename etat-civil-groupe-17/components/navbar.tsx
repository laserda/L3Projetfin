//"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "./Logo";
import { UserCircle, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import LogOutButton from "./LogOutButton";
import { ThemeToggle } from "./ThemeToggle";
import { getCitoyen } from "@/server/auth/citoyen";

export const Navbar = async () => {

    const user = await getCitoyen();

    // useEffect(() => {
    //     // Set the base URL using location
    //     setBaseUrl(`${location.protocol}//${location.host}`);

    // }, []);

    const navLinks = [
        { href: "/", label: "Accueil" },
        { href: `../#nos-service`, label: "Nouvelle Demande" },
        ...(user ? [{ href: "/suivi-demande", label: "Suivre mes demandes" }] : []),

    ];

    // mobile : entrées du menu (au moins 44 px de haut), qui referment le menu après la navigation
    const renderNavLinks = (mobile = false) => (
        <>
            {navLinks.map((link) => {
                const lien = (
                    <Link
                        href={link.href}
                        className={
                            mobile
                                ? "flex min-h-12 w-full items-center rounded-lg px-4 text-base font-medium text-foreground hover:bg-accent hover:text-primary active:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                : "inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        }
                    >
                        {link.label}
                    </Link>
                );
                return (
                    <li key={link.href}>
                        {mobile ? <SheetClose asChild>{lien}</SheetClose> : lien}
                    </li>
                );
            })}
        </>
    );

    return (
        <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm border-b border-border">
            {/* Bandeau aux couleurs du drapeau */}
            <div data-slot="bandeau-drapeau" aria-hidden="true" className="flex h-1">
                <span className="flex-1 bg-brand-orange" />
                <span className="flex-1 bg-brand-white" />
                <span className="flex-1 bg-brand-green" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center min-w-0">
                        <Link href="/" className="flex-shrink-0 flex items-center min-w-0 min-h-11 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Logo />
                        </Link>

                        {/* Desktop navigation */}
                        <div className="hidden md:ml-8 md:flex">
                            <ul className="flex items-center gap-1">{renderNavLinks()}</ul>
                        </div>
                    </div>

                    {/* Auth & mobile menu */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <p>{user.nom}</p>
                                <div className="shrink-0 [&>button]:h-11 [&>button]:min-w-11 [&>button]:rounded-full"><LogOutButton /></div>
                            </>
                        ) : (
                            <Link href="/login" className={cn(buttonVariants(), "h-11 min-w-11 rounded-full")}>
                                <UserCircle className="h-5 w-5" />
                                <span className="hidden sm:inline">Connexion</span>
                            </Link>
                        )}

                        {/* Mobile menu */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-11 rounded-full">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="gap-0 bg-card [&>button:last-child]:top-3 [&>button:last-child]:right-3 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-full">
                                    <div data-slot="bandeau-drapeau" aria-hidden="true" className="flex h-1 shrink-0">
                                        <span className="flex-1 bg-brand-orange" />
                                        <span className="flex-1 bg-brand-white" />
                                        <span className="flex-1 bg-brand-green" />
                                    </div>
                                    <SheetHeader className="border-b border-border pr-16">
                                        <SheetTitle>
                                            <Logo size="small" />
                                        </SheetTitle>
                                        <SheetDescription>
                                            Plateforme de gestion d'état civil
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="p-3">
                                        <ul className="flex flex-col gap-1">
                                            {renderNavLinks(true)}
                                        </ul>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
