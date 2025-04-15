import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoriqueService {
  async getAll() {
    // Appeler Prisma pour récupérer l'historique global
    return [
      { action: 'Création Acte', user: 'Agent X', date: new Date().toISOString() },
      { action: 'Modification Demande', user: 'Agent Y', date: new Date().toISOString() }
    ];
  }
}
