"use client";
import React, { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAllAgents } from "@/server/auth/agent";
import RegisterForm from "./tarifForm";
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
import { getTarif, getTarifByType, getTarifs } from "@/server/admin/tarif/tarif";
import { Eye } from "lucide-react";
import { FraisTimbre } from "@/lib/generated/prisma";

function page() {
    const [tarifs, setTarifs] = useState<any>([]);
    const [tarifSelected, setTarifSelected] = useState<FraisTimbre | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const gettarifs = async () => {
        setLoading(true);
        const res = await getTarifs();
        setTarifs(res);
        setLoading(false);
    };
    useEffect(() => {
        gettarifs();
    }, [refresh]);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
                <h1 className="text-2xl font-bold mb-6">Tarifs</h1>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger className={buttonVariants()}>
                        Ajouter un tarif
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouveau tarif</DialogTitle>
                        </DialogHeader>
                        <RegisterForm setIsOpen={setIsOpen} setRefresh={setRefresh} tarif={tarifSelected} refresh={refresh} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto">
                {tarifs ? (
                    <Table className="min-w-[32rem]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Prix timbre</TableHead>
                                <TableHead>Prix expedition</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tarifs.map((tarif: any) => (
                                <TableRow key={tarif.ID_FraisTimbre} className="hover:bg-muted">
                                    <TableCell>{tarif.TypeActe}</TableCell>

                                    <TableCell>
                                        {tarif.PrixTimbre}
                                    </TableCell>
                                    <TableCell>{tarif.FraisDossier} </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            onClick={async () => {
                                                const res = await getTarif(tarif.ID_FraisTimbre);
                                                setTarifSelected({ ...res, ID_FraisTimbre: tarif.ID_FraisTimbre })
                                                setIsOpen(true);
                                            }}
                                        >
                                            <Eye size={24} />
                                        </Button>
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