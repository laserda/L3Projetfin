"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import {
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    PieChart,
    X,
} from "lucide-react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { authClient } from "@/lib/auth-client";

const menuItems = [
    {
        label: "Tableau de bord",
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: "/dashboard",
    },
    {
        label: "Demandes",
        icon: <FileText className="h-5 w-5" />,
        href: "/dashboard/liste-demande",
    },
    {
        label: "Statistiques",
        icon: <PieChart className="h-5 w-5" />,
        href: "/dashboard/stats",
    },
];

function SideBar() {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <Button
                variant="ghost"
                onClick={toggleSidebar}
                className="md:hidden fixed left-2 top-3 z-20"
            >
                <Menu className="h-10 w-10" />
            </Button>

            <aside
                className={`
fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out 
${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
md:translate-x-0 md:z-auto
`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                        <Logo size="small" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            className="md:hidden"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1 py-4 overflow-y-auto">
                        <nav className="px-4 space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`
          flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${
              isActive
                  ? "bg-ci-orange/10 text-ci-orange"
                  : "text-gray-700 hover:bg-gray-100 hover:text-ci-orange"
          }
        `}
                                    >
                                        {item.icon}
                                        <span className="ml-3">
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-4 border-t">
                        <Button
                            variant="ghost"
                            onClick={async () => {
                                await authClient.signOut();

                                redirect("/");
                            }}
                            className="w-full justify-start text-gray-700 hover:text-ci-orange hover:bg-gray-100"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Déconnexion
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default SideBar;
