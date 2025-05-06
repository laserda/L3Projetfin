import { Request, RequestStats } from "@/types";

export const stats: RequestStats = {
    total: 10,
    pending: 5,
    approved: 3,
    rejected: 2,
    inProgress: 1,
    byType: {
        naissance: 5,
        mariage: 3,
        deces: 2,
    },
};
export const recentRequests: Request[] = [
    {
        id: "123456789",
        type: "naissance",
        nom: "Jean Dupont",
        prenom: "Jean",
        parents: "Jean Dupont",
        date: "2023-01-01",
        lieu: "Paris",
        email: "jean.dupont@example.com",
        statut: "approved",
        created_at: "2023-01-01T00:00:00.000Z",
        paymentConfirmed: true,
    },
    {
        id: "987654321",
        type: "naissance",
        nom: "Jean Dupont",
        prenom: "Jean",
        parents: "Jean Dupont",
        date: "2023-01-01",
        lieu: "Paris",
        email: "jean.dupont@example.com",
        statut: "pending",
        created_at: "2023-01-01T00:00:00.000Z",
        paymentConfirmed: true,
    },
];
