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
        case "naissance":
            return "Acte de naissance";
        case "mariage":
            return "Acte de mariage";
        case "deces":
            return "Acte de décès";
        default:
            return type;
    }
};
