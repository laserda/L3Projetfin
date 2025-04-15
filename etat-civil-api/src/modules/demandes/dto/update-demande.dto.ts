import { IsEnum, IsOptional } from 'class-validator';

export enum StatutDemandeEnum {
  Soumise = 'Soumise',
  En_traitement = 'En_traitement',
  Validée = 'Validée',
  Refusée = 'Refusée',
  Livrée = 'Livrée',
}

export class UpdateDemandeDto {
  @IsOptional()
  @IsEnum(StatutDemandeEnum)
  statut?: StatutDemandeEnum;

  @IsOptional()
  motif?: string;
}
