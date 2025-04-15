import { IsEnum, IsArray, IsUUID } from 'class-validator';

export enum TypeActe {
  Naissance = 'Naissance',
  Mariage = 'Mariage',
  Décès = 'Décès',
}

export class CreateDemandeDto {
  @IsEnum(TypeActe)
  type_acte: TypeActe;

  @IsArray()
  pieces_jointes: string[];

  @IsUUID()
  paiement_id: string;
}
