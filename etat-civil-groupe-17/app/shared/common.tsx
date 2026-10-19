import { StatutDemande } from "@/lib/generated/prisma";
import { ArrowUp, Check, Clock, FileText, X } from "lucide-react";


export const getStatusInfo = (status: string) => {
    switch (status) {
        case StatutDemande.SoumisePayee:
            return {
                icon: <Clock className="h-4 w-4" />,
                color: "text-warning",
                badge: "bg-warning/10 text-warning border-warning/30",
            };
        case StatutDemande.Validée:
            return {
                icon: <Check className="h-4 w-4" />,
                color: "text-success",
                badge: "bg-success/10 text-success border-success/30",
            };
        case StatutDemande.Livrée:
            return {
                icon: <Check className="h-4 w-4" />,
                color: "text-success",
                badge: "bg-success/10 text-success border-success/30",
            };
        case StatutDemande.Refusée:
            return {
                icon: <X className="h-4 w-4" />,
                color: "text-destructive",
                badge: "bg-destructive/10 text-destructive border-destructive/30",
            };
        case StatutDemande.EnTraitement:
            return {
                icon: <ArrowUp className="h-4 w-4" />,
                color: "text-info",
                badge: "bg-info/10 text-info border-info/30",
            };
        default:
            return {
                icon: <FileText className="h-4 w-4" />,
                color: "text-muted-foreground",
                badge: "bg-muted text-foreground border-border",
            };
    }
};
