import { Controller, Get } from '@nestjs/common';
import { StatistiquesService } from './statistiques.service';

@Controller('statistiques')
export class StatistiquesController {
  constructor(private readonly statistiquesService: StatistiquesService) {}

  @Get()
  async getStats() {
    return this.statistiquesService.getStats();
  }
}
