import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    uuid,
    decimal,
} from "drizzle-orm/pg-core";

import { pgEnum } from "drizzle-orm/pg-core";

// Enums pour le statut d'une demande
export const statutDemandeEnum = pgEnum("statut_demande", [
    "soumise",
    "en_traitement",
    "validée",
    "refusée",
    "livrée",
]);

// Enums pour les moyens de paiement
export const modePaiementEnum = pgEnum("mode_paiement", [
    "mobile_money",
    "carte_bancaire",
    "virement",
]);

// Enums pour les types d'entité modifiées
export const typeEntiteEnum = pgEnum("type_entite", ["demande", "acte"]);

export const agentRole = pgEnum("role", ["admin", "agent"]);

export const agent = pgTable("agent", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    role: agentRole("role").notNull().default("agent"),
    password: text("password").notNull(),
});

export const citoyen = pgTable("citoyen", {
    id: uuid("id").primaryKey().defaultRandom(),
    nom: text("nom").notNull(),
    prenom: text("prenom").notNull(),
    dateNaissance: timestamp("date_naissance").notNull(),
    lieuNaissance: text("lieu_naissance").notNull(),
    adresse: text("adresse").notNull(),
    email: text("email").notNull(),
    telephone: text("telephone").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const paiement = pgTable("paiement", {
    id: uuid("id").primaryKey().defaultRandom(),
    montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
    modePaiement: text("mode_paiement").notNull(), // Enum: mobile_money, carte_bancaire, virement
    datePaiement: timestamp("date_paiement").notNull(),
    transactionId: text("transaction_id").notNull(),
});

// Enums pour les types d'acte
export const typeActeEnum = pgEnum("type_acte", [
    "naissance",
    "mariage",
    "décès",
]);
export const demande = pgTable("demande", {
    id: uuid("id").primaryKey().defaultRandom(),
    citoyenId: uuid("citoyen_id")
        .notNull()
        .references(() => citoyen.id),
    typeActe: typeActeEnum("type_acte").notNull(),
    statut: statutDemandeEnum("statut_demande").notNull(),
    dateDemande: timestamp("date_demande").notNull(),
    paiementId: uuid("paiement_id").references(() => paiement.id),
});

export const documentActe = pgTable("document_acte", {
    id: uuid("id").primaryKey().defaultRandom(),
    demandeId: uuid("demande_id")
        .notNull()
        .references(() => demande.id),
    dateDelivrance: timestamp("date_delivrance").notNull(),
    signatureNumerique: text("signature_numerique").notNull(),
    estArchive: boolean("est_archive").notNull().default(false),
    dateArchivage: timestamp("date_archivage"),
    fichierPdf: text("fichier_pdf").notNull(),
});

export const historiqueModifications = pgTable("historique_modifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    typeEntite: text("type_entite").notNull(),
    entiteId: uuid("entite_id").notNull(),
    agentId: text("agent_id")
        .notNull()
        .references(() => agent.id),
    action: text("action").notNull(),
    dateModification: timestamp("date_modification").notNull(),
    ancienneValeur: text("ancienne_valeur"),
    nouvelleValeur: text("nouvelle_valeur"),
});

export const schema = {
    agent,
    citoyen,
    demande,
    paiement,
    documentActe,
    historiqueModifications,
};
