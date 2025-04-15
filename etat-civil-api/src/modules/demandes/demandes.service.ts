import { Injectable } from '@nestjs/common';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';

@Injectable()
export class DemandesService {
  async create(dto: CreateDemandeDto) {
    // Appeler Prisma pour créer la demande
    return { message: 'Demande créée', ...dto };
  }

  async findMyDemandes() {
    // Appeler Prisma pour récupérer les demandes du citoyen connecté
    return [
      { id: 'uuid1', statut: 'Soumise' },
      { id: 'uuid2', statut: 'Validée' }
    ];
  }

  async historique() {
    // Appeler Prisma pour récupérer l'historique
    return [
      { type_acte: 'Naissance', date: new Date().toISOString(), statut: 'Validée' }
    ];
  }

  async decision(id: string, dto: UpdateDemandeDto) {
    // Valider ou refuser une demande
    return { message: 'Demande mise à jour', id, ...dto };
  }

  async getPending() {
    // Retourne les demandes en attente (statut = 'Soumise' ou 'En_traitement')
    return [
      { id: 'uuid1', citoyen: 'John Doe', type_acte: 'Naissance' }
    ];
  }
}
