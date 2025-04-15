import { Injectable } from '@nestjs/common';
import { InitierPaiementDto } from './dto/initier-paiement.dto';

@Injectable()
export class PaiementService {
  async initier(dto: InitierPaiementDto) {
    // Appeler le service de paiement externe ou générer une URL de paiement fictive
    return { payment_url: 'https://paiement.mock/' + dto.demande_id };
  }
}
