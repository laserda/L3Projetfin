"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { LogOut, LoaderCircle } from "lucide-react";
import { logout } from "@/server/auth/citoyen";

function LogOutButton() {
    const [loading, setLoading] = useState(false);

    return (
        <Button
            variant="secondary"
            onClick={async () => {
                setLoading(true);
                await logout();
                setLoading(false);
            }}
            className="w-full justify-center text-gray-700 hover:text-ci-green hover:bg-gray-100"
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
