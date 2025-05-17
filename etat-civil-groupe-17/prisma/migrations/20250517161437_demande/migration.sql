-- CreateTable
CREATE TABLE "FraisTimbre" (
    "ID_FraisTimbre" SERIAL NOT NULL,
    "TypeActe" "TypeActe" NOT NULL,
    "PrixTimbre" DOUBLE PRECISION NOT NULL,
    "FraisDossier" DOUBLE PRECISION DEFAULT 0,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FraisTimbre_pkey" PRIMARY KEY ("ID_FraisTimbre")
);

-- CreateIndex
CREATE UNIQUE INDEX "FraisTimbre_TypeActe_key" ON "FraisTimbre"("TypeActe");
