"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LogOut, LoaderCircle } from "lucide-react";
import { logout as logoutCitoyen } from "@/server/auth/citoyen";
import { logout as logoutAgent } from "@/server/auth/agent";

type LogOutButtonProps = {
    // "admin" pour l'espace agents (tableau de bord), "citoyen" par défaut
    espace?: "citoyen" | "admin";
};

function LogOutButton({ espace = "citoyen" }: LogOutButtonProps) {
    const [loading, setLoading] = useState(false);
    const handleLogout = async () => {
        setLoading(true);
        if (espace === "admin") {
            await logoutAgent();
        } else {
            await logoutCitoyen();
        }
        setLoading(false);
    }

    return (
        <Button
            variant="secondary"
            onClick={handleLogout}
            className="w-full"
            aria-label="Se déconnecter"
            title="Se déconnecter"
        >
            {loading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
                <LogOut className="h-5 w-5" />
            )}
        </Button>
    );
}

export default LogOutButton;
