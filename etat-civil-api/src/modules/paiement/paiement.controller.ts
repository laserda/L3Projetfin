import { Controller, Post, Body } from '@nestjs/common';
import { PaiementService } from './paiement.service';
import { InitierPaiementDto } from './dto/initier-paiement.dto';

@Controller('paiements')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  @Post('initier')
  async initier(@Body() dto: InitierPaiementDto) {
    return this.paiementService.initier(dto);
  }
}
