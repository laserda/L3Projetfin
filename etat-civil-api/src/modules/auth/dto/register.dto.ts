import { IsEmail, IsString, MinLength, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  telephone: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  dateNaissance: string;

  @ApiProperty({ example: 'Abidjan' })
  @IsString()
  lieuNaissance: string;

  @ApiProperty({ example: 'Cocody, Abidjan' })
  @IsString()
  adresse: string;
}
