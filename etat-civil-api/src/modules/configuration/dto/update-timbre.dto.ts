import { IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TypeActe {
  Naissance = 'Naissance',
  Mariage = 'Mariage',
  Décès = 'Décès',
}

export class UpdateTimbreDto {
  @ApiProperty({ enum: TypeActe })
  @IsEnum(TypeActe)
  type_acte: TypeActe;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  prix: number;
}
