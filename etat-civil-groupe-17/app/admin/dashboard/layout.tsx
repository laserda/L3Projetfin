import { ReactNode } from "react";

import SideBar from "@/components/SideBar";
import "../../globals.css";

import { getAgent } from "@/server/auth/agent";

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const agent = await getAgent();
    return (
        <main className="min-h-screen flex flex-col">
            <div className="flex flex-1 h-screen bg-background">
                <SideBar />

                <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
                    <header className="bg-card/95 backdrop-blur border-b shadow-sm z-10 fixed w-full p-4 flex items-center justify-between">
                        {/* Une seule ligne : sur téléphone, l'en-tête ne masque plus le contenu */}
                        <h1
                            className="text-base md:text-xl font-semibold text-foreground ml-14 min-w-0 truncate"
                            title={`${agent?.Nom ?? ""} - ${agent?.Email ?? ""} - ${agent?.Role ?? ""}`}
                        >
                            {agent?.Nom} - {agent?.Email} - {agent?.Role}
                        </h1>
                    </header>

                    <section className="flex-1 p-4 mt-14">{children}</section>
                </div>
            </div>
        </main>
    );
}
