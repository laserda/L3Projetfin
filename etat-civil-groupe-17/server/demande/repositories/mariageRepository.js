import { GenericRepository } from "../../repositories/genericRepository";

export class MarigeRepository extends GenericRepository {
  constructor() {
    super("mariage"); // le nom du modèle Prisma (minuscule par convention)
  }
}
