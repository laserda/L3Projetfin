import { Controller, Post, Body, Get, Put, Param } from '@nestjs/common';
import { DemandesService } from './demandes.service';
import { CreateDemandeDto, TypeActe } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';

@Controller('demandes')
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Post()
  async create(@Body() dto: CreateDemandeDto) {
    return this.demandesService.create(dto);
  }

  @Get('mes')
  async findMyDemandes() {
    return this.demandesService.findMyDemandes();
  }

  @Get('historique')
  async historique() {
    return this.demandesService.historique();
  }

  @Get('pending')
  async getPending() {
    return this.demandesService.getPending();
  }

  @Put(':id/decision')
  async decision(@Param('id') id: string, @Body() dto: UpdateDemandeDto) {
    return this.demandesService.decision(id, dto);
  }
}
