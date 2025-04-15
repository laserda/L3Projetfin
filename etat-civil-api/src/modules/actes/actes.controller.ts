import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { ActesService } from './actes.service';

@Controller('actes')
export class ActesController {
  constructor(private readonly actesService: ActesService) {}

  @Post()
  async generer(@Body() body: { demande_id: string }) {
    return this.actesService.generer(body.demande_id);
  }

  @Get(':id/telecharger')
  async telecharger(@Param('id') id: string) {
    return this.actesService.telecharger(id);
  }

  @Put(':id/archiver')
  async archiver(@Param('id') id: string, @Body() body: { raison: string }) {
    return this.actesService.archiver(id, body.raison);
  }
}
