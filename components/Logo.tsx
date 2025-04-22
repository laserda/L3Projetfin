// import Image from "next/image";
import { FC } from "react";

interface LogoProps {
    size?: "small" | "medium" | "large";
    className?: string;
}

export const Logo: FC<LogoProps> = ({ size = "medium", className = "" }) => {
    const sizeClasses = {
        small: "text-lg",
        medium: "text-2xl",
        large: "text-4xl",
    };

    return (
        <div
            className={`font-bold flex items-center ${sizeClasses[size]} ${className}`}
        >
            {/* <Image src="./icon0.svg" alt="Logo" width={40} height={40} /> */}
            <span className="text-ci-orange">État</span>
            <span className="text-ci-green mx-1">Civil</span>
            <span className="text-ci-orange">CI</span>
        </div>
    );
};
