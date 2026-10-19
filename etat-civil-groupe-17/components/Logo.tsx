import { FC } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "small" | "medium" | "large";
    className?: string;
}

// Logo État Civil CI : emblème vectoriel (SVG, net sur tous les écrans)
// aux couleurs de la marque + nom du service. Couleurs issues des variables de thème.
export const Logo: FC<LogoProps> = ({ size = "medium", className = "" }) => {
    const sizeClasses = {
        small: { text: "text-lg", mark: "h-7 w-7" },
        medium: { text: "text-xl sm:text-2xl", mark: "h-8 w-8 sm:h-9 sm:w-9" },
        large: { text: "text-3xl sm:text-4xl", mark: "h-11 w-11 sm:h-12 sm:w-12" },
    };

    return (
        <div
            data-slot="logo"
            className={cn(
                "font-heading font-bold tracking-tight flex items-center gap-2 whitespace-nowrap leading-none",
                sizeClasses[size].text,
                className
            )}
        >
            <svg
                viewBox="0 0 40 40"
                aria-hidden="true"
                focusable="false"
                className={cn("shrink-0 drop-shadow-sm", sizeClasses[size].mark)}
            >
                {/* Écusson aux trois bandes du drapeau ivoirien */}
                <path
                    d="M12 2H14V38H12A10 10 0 0 1 2 28V12A10 10 0 0 1 12 2Z"
                    className="fill-brand-orange"
                />
                <rect x="14" y="2" width="12" height="36" className="fill-brand-white" />
                <path
                    d="M26 2H28A10 10 0 0 1 38 12V28A10 10 0 0 1 28 38H26Z"
                    className="fill-brand-green"
                />
                <rect
                    x="2.5"
                    y="2.5"
                    width="35"
                    height="35"
                    rx="9.5"
                    fill="none"
                    strokeWidth="1"
                    className="stroke-border"
                />
                {/* Document officiel au centre */}
                <path
                    d="M14.5 10.5h8l4 4v15a1.5 1.5 0 0 1-1.5 1.5h-10.5a1.5 1.5 0 0 1-1.5-1.5v-17.5a1.5 1.5 0 0 1 1.5-1.5z"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    className="fill-paper stroke-paper-border"
                />
                <path
                    d="M16.5 19h7M16.5 22.5h7M16.5 26h4.5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    className="stroke-brand-orange"
                />
            </svg>
            <span className="flex items-baseline">
                <span className="text-brand-orange">État</span>
                <span className="text-brand-green mx-1">Civil</span>
                <span className="text-brand-orange">CI</span>
            </span>
        </div>
    );
};
