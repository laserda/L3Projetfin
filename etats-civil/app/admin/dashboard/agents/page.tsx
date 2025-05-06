"use client";
import React, { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAllAgents } from "@/server/auth/agent";
// import { formatDate } from "@/utils";
import RegisterForm from "./registerForm";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function page() {
    const [agents, setAgents] = useState<any>([]);
    const getAgents = async () => {
        const res = await getAllAgents();
        const users = res.filter((user) => user.role === "agent");
        setAgents(users);
    };
    useEffect(() => {
        getAgents();
    }, []);

    return (
        <>
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-6">Agents</h1>

                <Dialog>
                    <DialogTrigger className={buttonVariants()}>
                        Ajouter un agent
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouvel agent</DialogTitle>
                            <DialogDescription></DialogDescription>
                        </DialogHeader>
                        <RegisterForm />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto">
                {agents ? (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium">
                                    Type
                                </th>
                                <th className="text-left py-3 px-4 font-medium">
                                    Nom
                                </th>
                                <th className="text-left py-3 px-4 font-medium">
                                    Email
                                </th>
                                <th className="text-left py-3 px-4 font-medium">
                                    Date
                                </th>
                                <th className="text-right py-3 px-4 font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((agent: any) => (
                                <tr
                                    key={agent.id}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="py-3 px-4">{agent.role}</td>

                                    <td className="py-3 px-4">{agent.name}</td>
                                    <td className="py-3 px-4">
                                        {agent.email}{" "}
                                    </td>
                                    <td className="py-3 px-4">
                                        {agent.created_at}{" "}
                                    </td>

                                    <td className="py-3 px-4 text-right">
                                        <Button size="sm" variant="link">
                                            Voir
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center text-gray-500 text-xl">
                        Aucun agent enregistré
                    </div>
                )}
            </div>
        </>
    );
}

export default page;
