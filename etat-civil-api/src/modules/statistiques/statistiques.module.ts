import { Module } from '@nestjs/common';
import { StatistiquesService } from './statistiques.service';
import { StatistiquesController } from './statistiques.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatistiquesController],
  providers: [StatistiquesService],
})
export class StatistiquesModule {}
