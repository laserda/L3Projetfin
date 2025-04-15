import { Injectable } from '@nestjs/common';

@Injectable()
export class ActesService {
  async generer(demande_id: string) {
    // Générer un acte signé (mock)
    return { message: 'Acte généré', pdf_url: `/api/actes/${demande_id}/telecharger` };
  }

  async telecharger(id: string) {
    // Retourner un PDF fictif (mock)
    return { pdf: `PDF binaire pour l'acte ${id}` };
  }

  async archiver(id: string, raison: string) {
    // Archiver l'acte (mock)
    return { message: `Acte ${id} archivé pour raison : ${raison}` };
  }
}
