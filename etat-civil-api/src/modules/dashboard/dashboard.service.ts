import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getDashboard() {
    return {
      total_demandes: 1000,
      total_paiements: 500000,
      statut_distribution: { Soumise: 200, Validée: 700, Refusée: 100 }
    };
  }
}
