import { StatutDemande } from "@/lib/generated/prisma";
import { ArrowUp, Check, Clock, FileText, X } from "lucide-react";


export const getStatusInfo = (status: string) => {
    switch (status) {
        case StatutDemande.SoumisePayee:
            return {
                icon: <Clock className="h-4 w-4" />,
                color: "text-yellow-500",
                badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
            };
        case StatutDemande.Validée:
            return {
                icon: <Check className="h-4 w-4" />,
                color: "text-green-500",
                badge: "bg-green-50 text-green-700 border-green-200",
            };
        case StatutDemande.Livrée:
            return {
                icon: <Check className="h-4 w-4" />,
                color: "text-green-500",
                badge: "bg-green-50 text-green-700 border-green-200",
            };
        case StatutDemande.Refusée:
            return {
                icon: <X className="h-4 w-4" />,
                color: "text-red-500",
                badge: "bg-red-50 text-red-700 border-red-200",
            };
        case StatutDemande.EnTraitement:
            return {
                icon: <ArrowUp className="h-4 w-4" />,
                color: "text-blue-500",
                badge: "bg-blue-50 text-blue-700 border-blue-200",
            };
        default:
            return {
                icon: <FileText className="h-4 w-4" />,
                color: "text-gray-500",
                badge: "bg-gray-50 text-gray-700 border-gray-200",
            };
    }
};
