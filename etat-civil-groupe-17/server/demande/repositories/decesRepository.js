import { GenericRepository } from "../../repositories/genericRepository";

export class DecesRepository extends GenericRepository {
  constructor() {
    super("deces"); // le nom du modèle Prisma (minuscule par convention)
  }
}
