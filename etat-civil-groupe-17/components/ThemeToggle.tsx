"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

// Bouton de bascule clair / sombre (en-tête public et menu de l'administration)
export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme();
    const [monte, setMonte] = useState(false);
    useEffect(() => setMonte(true), []);

    const sombre = monte && resolvedTheme === "dark";
    const libelle = sombre ? "Passer en mode clair" : "Passer en mode sombre";

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            data-slot="theme-toggle"
            aria-label={libelle}
            title={libelle}
            onClick={() => setTheme(sombre ? "light" : "dark")}
            className={className ?? "size-11 rounded-full"}
        >
            {sombre ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
}
