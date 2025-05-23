import { GenericRepository } from "../../repositories/genericRepository"

export class HistoriqueRepository extends GenericRepository {
  constructor() {
    super('Historique_Modifications') // le nom du modèle Prisma (minuscule par convention)
  }


}