import { Module } from '@nestjs/common';
import { ActesService } from './actes.service';
import { ActesController } from './actes.controller';

@Module({
  controllers: [ActesController],
  providers: [ActesService],
})
export class ActesModule {}
