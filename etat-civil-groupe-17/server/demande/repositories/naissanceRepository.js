import { GenericRepository } from "../../repositories/genericRepository"

export class NaissanceRepository extends GenericRepository {
  constructor() {
    super('naissance') // le nom du modèle Prisma (minuscule par convention)
  }
}