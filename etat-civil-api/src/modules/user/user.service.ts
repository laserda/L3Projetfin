import { Injectable } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';

@Injectable()
export class UserService {
  async getMe() {
    // Retourne un utilisateur fictif pour l'exemple
    return {
      id: 'uuid',
      nom: 'Doe',
      prenom: 'John',
      email: 'john.doe@example.com',
      telephone: '0102030405',
    };
  }

  async createAgent(dto: CreateAgentDto) {
    // Crée un agent en base (mock)
    return { id: 'uuid', ...dto };
  }
}
