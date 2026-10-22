"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
    FileText,
    LayoutDashboard,
    Menu,
    PieChart,
    User,
    HandCoins,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import LogOutButton from "./LogOutButton";
import { ThemeToggle } from "./ThemeToggle";
import { getAgent } from "@/server/auth/agent";
import { Agent } from "@/lib/generated/prisma";



function SideBar() {
    let [user, setUser] = useState<Agent | null>(null)
    const getUser = async () => {
        const res = await getAgent()
        setUser(res)
    }
    useEffect(() => {
        getUser()
    }, [])
    const menuItems = [
        {
            label: "Tableau de bord",
            icon: <LayoutDashboard className="h-5 w-5" />,
            href: "/admin/dashboard",
        },
        {
            label: "Demandes",
            icon: <FileText className="h-5 w-5" />,
            href: "/admin/dashboard/liste-demande",
        },
        {
            label: "Statistiques",
            icon: <PieChart className="h-5 w-5" />,
            href: "/admin/dashboard/stats",
        },
        ...(user?.Role === "Administrateur" ? [{
            label: "Agents",
            icon: <User className="h-5 w-5" />,
            href: "/admin/dashboard/agents",
        }, {
            label: "Tarifs",
            icon: <HandCoins className="h-5 w-5" />,
            href: "/admin/dashboard/tarif",
        }] : []),

    ];
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-overlay/50 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <Button
                variant="ghost"
                onClick={toggleSidebar}
                className="md:hidden fixed left-2 top-3 z-20 min-h-11 min-w-11"
            >
                <Menu className="h-10 w-10" />
            </Button>

            <aside
                className={`
fixed top-0 left-0 z-30 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm md:shadow-none transition-transform duration-300 ease-in-out 
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
                            className="md:hidden min-h-11 min-w-11"
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
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
          flex items-center min-h-11 px-3 py-2 rounded-md text-sm font-medium transition-colors
          ${isActive
                                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                            }
        `}
                                    >
                                        {item.icon}
                                        <span className="ml-3">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className={`p-4 border-t w-full flex gap-2 [&_button]:min-h-11`}>
                        <ThemeToggle className="min-h-11 min-w-11 shrink-0" />
                        <LogOutButton espace="admin" />
                    </div>
                </div>
            </aside>
        </>
    );
}

export default SideBar;