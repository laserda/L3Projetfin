export type RequestType = "naissance" | "mariage" | "deces";

export type RequestStatus = "pending" | "approved" | "rejected" | "inProgress";

export interface Request {
    id: string;
    type: RequestType;
    nom: string;
    prenom: string;
    parents?: string;
    date: string;
    lieu: string;
    email: string;
    statut: RequestStatus;
    created_at: string;
    paymentConfirmed: boolean;
}

export interface User {
    id: string;
    email: string;
    role: "admin" | "user";
}

export interface RequestFormData {
    type: RequestType;
    nom: string;
    prenom: string;
    parents?: string;
    date: string;
    lieu: string;
    email: string;
    paymentConfirmed: boolean;
}

export interface RequestStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    inProgress: number;
    byType: {
        naissance: number;
        mariage: number;
        deces: number;
    };
}
