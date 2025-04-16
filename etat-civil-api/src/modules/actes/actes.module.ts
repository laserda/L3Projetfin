import { Module } from '@nestjs/common';
import { ActesService } from './actes.service';
import { ActesController } from './actes.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActesController],
  providers: [ActesService],
})
export class ActesModule {}
