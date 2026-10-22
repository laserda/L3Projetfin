"use client";
import React, { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { getAllAgents } from "@/server/auth/agent";
import RegisterForm from "./registerForm";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Loader } from "@/components/Loader";

function page() {
    const [agents, setAgents] = useState<any>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const getAgents = async () => {
        setLoading(true);
        const res = await getAllAgents();
        setAgents(res);
        setLoading(false);
    };
    useEffect(() => {
        getAgents();
    }, [refresh]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                <h1 className="text-2xl font-bold mb-6">Agents</h1>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger className={buttonVariants()}>
                        Ajouter un agent
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouvel agent</DialogTitle>
                        </DialogHeader>
                        <RegisterForm setIsOpen={setIsOpen} setRefresh={setRefresh} refresh={refresh} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto">
                {agents ? (
                    <Table className="min-w-[32rem]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents.map((agent: any) => (
                                <TableRow key={agent.ID_Agent} className="hover:bg-muted">
                                    <TableCell>{agent.Role}</TableCell>

                                    <TableCell>
                                        {agent.Nom} - {agent.Prenom}
                                    </TableCell>
                                    <TableCell>{agent.Email} </TableCell>

                                    <TableCell className="text-right">
                                        <Link
                                            href={`/admin/dashboard/agents/${agent.ID_Agent}`}
                                            className={buttonVariants({ variant: "link" })}
                                        >
                                            Voir
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground text-xl">
                        Aucun agent enregistré
                    </div>
                )}
            </div>
        </>
    );
}

export default page;