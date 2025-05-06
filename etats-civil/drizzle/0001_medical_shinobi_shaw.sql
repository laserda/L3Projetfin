CREATE TABLE "agent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"role" "role" DEFAULT 'agent' NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "agent_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "demande" CASCADE;--> statement-breakpoint
DROP TABLE "document_acte" CASCADE;--> statement-breakpoint
DROP TABLE "historique_modifications" CASCADE;--> statement-breakpoint
DROP TABLE "paiement" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "citoyen" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "citoyen" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "citoyen" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
DROP TYPE "public"."mode_paiement";--> statement-breakpoint
DROP TYPE "public"."statut_demande";--> statement-breakpoint
DROP TYPE "public"."type_acte";--> statement-breakpoint
DROP TYPE "public"."type_entite";