//"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Logo } from "./Logo";
import { UserCircle, Menu } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import LogOutButton from "./LogOutButton";
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

    const renderNavLinks = () => (
        <>
            {navLinks.map((link) => (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        className="text-foreground/80 hover:text-primary hover:bg-accent transition-colors px-3 py-2 rounded-md text-sm font-medium"
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </>
    );

    return (
        <nav className="sticky top-0 z-40 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center min-w-0">
                        <Link href="/" className="flex-shrink-0 flex items-center min-w-0">
                            <Logo />
                        </Link>

                        {/* Desktop navigation */}
                        <div className="hidden md:ml-6 md:flex md:space-x-4">
                            <ul className="flex space-x-1">{renderNavLinks()}</ul>
                        </div>
                    </div>

                    {/* Auth & mobile menu */}
                    <div className="flex items-center gap-2 shrink-0">
                        {user ? (
                            <>
                                <p>{user.nom}</p>
                                <div className="shrink-0"><LogOutButton /></div>
                            </>
                        ) : (
                            <Link href="/login" className={buttonVariants()}>
                                <UserCircle className="h-5 w-5" />
                                <span className="hidden sm:inline">Connexion</span>
                            </Link>
                        )}

                        {/* Mobile menu */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>
                                            <Logo size="small" />
                                        </SheetTitle>
                                        <SheetDescription>
                                            Plateforme de gestion d'état civil
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="py-4">
                                        <ul className="flex flex-col space-y-3">
                                            {renderNavLinks()}
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
