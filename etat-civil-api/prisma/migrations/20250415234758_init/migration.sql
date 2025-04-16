-- CreateEnum
CREATE TYPE "TypeActe" AS ENUM ('Naissance', 'Mariage', 'Décès');

-- CreateEnum
CREATE TYPE "StatutDemande" AS ENUM ('Soumise', 'En_traitement', 'Validée', 'Refusée', 'Livrée');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('Mobile_Money', 'Carte_Bancaire', 'Virement');

-- CreateEnum
CREATE TYPE "RoleAgent" AS ENUM ('Agent', 'Administrateur');

-- CreateEnum
CREATE TYPE "TypeEntite" AS ENUM ('Demande', 'Acte');

-- CreateTable
CREATE TABLE "Citoyen" (
    "id_citoyen" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "lieu_naissance" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,

    CONSTRAINT "Citoyen_pkey" PRIMARY KEY ("id_citoyen")
);

-- CreateTable
CREATE TABLE "Demande" (
    "id_demande" TEXT NOT NULL,
    "id_citoyen" TEXT NOT NULL,
    "type_acte" "TypeActe" NOT NULL,
    "statut" "StatutDemande" NOT NULL,
    "date_demande" TIMESTAMP(3) NOT NULL,
    "id_paiement" TEXT,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id_demande")
);

-- CreateTable
CREATE TABLE "Acte" (
    "id_acte" TEXT NOT NULL,
    "id_demande" TEXT NOT NULL,
    "date_delivrance" TIMESTAMP(3) NOT NULL,
    "fichier_pdf" TEXT NOT NULL,
    "signature_numerique" TEXT NOT NULL,
    "est_archive" BOOLEAN NOT NULL DEFAULT false,
    "date_archivage" TIMESTAMP(3),
    "id_agent" TEXT,

    CONSTRAINT "Acte_pkey" PRIMARY KEY ("id_acte")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id_paiement" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "mode_paiement" "ModePaiement" NOT NULL,
    "date_paiement" TIMESTAMP(3) NOT NULL,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id_paiement")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id_agent" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "RoleAgent" NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id_agent")
);

-- CreateTable
CREATE TABLE "HistoriqueModification" (
    "id_historique" TEXT NOT NULL,
    "type_entite" "TypeEntite" NOT NULL,
    "id_entite" TEXT NOT NULL,
    "id_agent" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "date_modification" TIMESTAMP(3) NOT NULL,
    "ancienne_valeur" TEXT NOT NULL,
    "nouvelle_valeur" TEXT NOT NULL,
    "id_demande" TEXT,
    "id_acte" TEXT,

    CONSTRAINT "HistoriqueModification_pkey" PRIMARY KEY ("id_historique")
);

-- CreateIndex
CREATE UNIQUE INDEX "Citoyen_email_key" ON "Citoyen"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Acte_id_demande_key" ON "Acte"("id_demande");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_id_citoyen_fkey" FOREIGN KEY ("id_citoyen") REFERENCES "Citoyen"("id_citoyen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_id_paiement_fkey" FOREIGN KEY ("id_paiement") REFERENCES "Paiement"("id_paiement") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acte" ADD CONSTRAINT "Acte_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "Demande"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acte" ADD CONSTRAINT "Acte_id_agent_fkey" FOREIGN KEY ("id_agent") REFERENCES "Agent"("id_agent") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueModification" ADD CONSTRAINT "HistoriqueModification_id_agent_fkey" FOREIGN KEY ("id_agent") REFERENCES "Agent"("id_agent") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueModification" ADD CONSTRAINT "HistoriqueModification_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "Demande"("id_demande") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriqueModification" ADD CONSTRAINT "HistoriqueModification_id_acte_fkey" FOREIGN KEY ("id_acte") REFERENCES "Acte"("id_acte") ON DELETE SET NULL ON UPDATE CASCADE;
