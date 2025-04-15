import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // Ici tu feras l'appel Prisma pour créer un citoyen
    // Hash du mot de passe
    const hash = await bcrypt.hash(dto.password, 10);
    // TODO: Insérer le citoyen en base
    return { message: 'Inscription réussie (mock)', email: dto.email };
  }

  async login(dto: LoginDto) {
    // Ici tu feras l'appel Prisma pour vérifier le citoyen
    // TODO: Vérifier le mot de passe
    // Générer le JWT
    const token = this.jwtService.sign({ email: dto.email, role: 'citoyen' });
    return { token };
  }

  async loginAgent(dto: LoginDto) {
    // Vérifier l'email et le mot de passe dans la table Agent
    // Générer le JWT avec role: 'agent'
    return { token: this.jwtService.sign({ email: dto.email, role: 'agent' }) };
  }
}
