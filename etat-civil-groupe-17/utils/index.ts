import { TypeActe } from "@/lib/generated/prisma";
// Formater les dates
export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

// Obtenir le nom du type de demande
export const getRequestTypeName = (type: string) => {
    switch (type) {
        case TypeActe.Naissance:
            return "Acte de naissance";
        case TypeActe.Mariage:
            return "Acte de mariage";
        case TypeActe.Décès:
            return "Acte de décès";
        default:
            return type;
    }
};
