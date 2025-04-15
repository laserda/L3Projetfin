import { IsNumber, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MethodePaiement {
  MobileMoney = 'MobileMoney',
  Carte = 'Carte',
}

export class InitierPaiementDto {
  @ApiProperty({ example: 2000 })
  @IsNumber()
  montant: number;

  @ApiProperty({ enum: MethodePaiement, example: MethodePaiement.MobileMoney })
  @IsEnum(MethodePaiement)
  methode: MethodePaiement;

  @ApiProperty({ example: 'uuid-demande' })
  @IsUUID()
  demande_id: string;
}
