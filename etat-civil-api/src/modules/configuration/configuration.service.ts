import { Injectable } from '@nestjs/common';
import { UpdateTimbreDto } from './dto/update-timbre.dto';

@Injectable()
export class ConfigurationService {
  async updateTimbres(dto: UpdateTimbreDto) {
    // Met à jour le prix du timbre pour un type d'acte
    return { message: 'Timbre mis à jour', ...dto };
  }
}
