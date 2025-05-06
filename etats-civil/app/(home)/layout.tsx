import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "État Civil CI",
    description:
        "Plateforme en ligne pour les demandes d'actes d'état civil en Côte d'Ivoire.",
    keywords: [
        "état civil",
        "Côte d'Ivoire",
        "acte de naissance",
        "mariage",
        "décès",
        "en ligne",
    ],
};

import "../globals.css";
import { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr">
            <body className="min-h-screen flex flex-col">
                <TooltipProvider>
                    <Sonner />
                    <Navbar />

                    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </main>
                    <Footer />
                </TooltipProvider>
            </body>
        </html>
    );
}
