CREATE TYPE "public"."mode_paiement" AS ENUM('mobile_money', 'carte_bancaire', 'virement');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'agent');--> statement-breakpoint
CREATE TYPE "public"."statut_demande" AS ENUM('soumise', 'en_traitement', 'validée', 'refusée', 'livrée');--> statement-breakpoint
CREATE TYPE "public"."type_acte" AS ENUM('naissance', 'mariage', 'décès');--> statement-breakpoint
CREATE TYPE "public"."type_entite" AS ENUM('demande', 'acte');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citoyen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"date_naissance" timestamp NOT NULL,
	"lieu_naissance" text NOT NULL,
	"adresse" text NOT NULL,
	"email" text NOT NULL,
	"telephone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demande" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"citoyen_id" uuid NOT NULL,
	"type_acte" text NOT NULL,
	"statut" text NOT NULL,
	"date_demande" timestamp NOT NULL,
	"paiement_id" uuid
);
--> statement-breakpoint
CREATE TABLE "document_acte" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"demande_id" uuid NOT NULL,
	"date_delivrance" timestamp NOT NULL,
	"signature_numerique" text NOT NULL,
	"est_archive" boolean DEFAULT false NOT NULL,
	"date_archivage" timestamp,
	"fichier_pdf" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historique_modifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_entite" text NOT NULL,
	"entite_id" uuid NOT NULL,
	"agent_id" text NOT NULL,
	"action" text NOT NULL,
	"date_modification" timestamp NOT NULL,
	"ancienne_valeur" text,
	"nouvelle_valeur" text
);
--> statement-breakpoint
CREATE TABLE "paiement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"montant" numeric(10, 2) NOT NULL,
	"mode_paiement" text NOT NULL,
	"date_paiement" timestamp NOT NULL,
	"transaction_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'agent' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demande" ADD CONSTRAINT "demande_citoyen_id_citoyen_id_fk" FOREIGN KEY ("citoyen_id") REFERENCES "public"."citoyen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "demande" ADD CONSTRAINT "demande_paiement_id_paiement_id_fk" FOREIGN KEY ("paiement_id") REFERENCES "public"."paiement"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acte" ADD CONSTRAINT "document_acte_demande_id_demande_id_fk" FOREIGN KEY ("demande_id") REFERENCES "public"."demande"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historique_modifications" ADD CONSTRAINT "historique_modifications_agent_id_user_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;