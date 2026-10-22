"use client";

import { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Montage du thème : classe « dark » sur <html>, choix mémorisé par navigateur
// (localStorage, clé « theme ») et partagé par le site public et l'administration.
export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="theme"
        >
            {children}
        </NextThemesProvider>
    );
}
