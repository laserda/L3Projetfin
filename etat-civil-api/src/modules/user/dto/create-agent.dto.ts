import { IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum AgentRole {
  Agent = 'Agent',
  Admin = 'Admin',
}

export class CreateAgentDto {
  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'agent@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: AgentRole })
  @IsEnum(AgentRole)
  role: AgentRole;
}
