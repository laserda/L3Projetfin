import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async register(dto: RegisterDto) {
    try {
      const existing = await this.prisma.citoyen.findUnique({ where: { email: dto.email } });
      if (existing) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
      const hash = await bcrypt.hash(dto.password, 10);
      const citoyen = await this.prisma.citoyen.create({
        data: {
          email: dto.email,
          telephone: dto.telephone,
          nom: dto.nom,
          prenom: dto.prenom,
          password: hash,
          dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : new Date(),
          lieuNaissance: dto.lieuNaissance || '',
          adresse: dto.adresse || '',
        },
      });
      return { message: 'Inscription réussie', email: citoyen.email };
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de l\'inscription');
    }
  }

  async login(dto: LoginDto) {
    try {
      const citoyen = await this.prisma.citoyen.findUnique({ where: { email: dto.email } });
      if (!citoyen) {
        throw new UnauthorizedException('Identifiants invalides');
      }
      const valid = await bcrypt.compare(dto.password, citoyen.password);
      if (!valid) {
        throw new UnauthorizedException('Identifiants invalides');
      }
      const token = this.jwtService.sign({ email: citoyen.email, role: 'citoyen', id: citoyen.id });
      return { token };
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la connexion');
    }
  }

  async loginAgent(dto: LoginDto) {
    try {
      const agent = await this.prisma.agent.findUnique({ where: { email: dto.email } });
      if (!agent) {
        throw new UnauthorizedException('Identifiants invalides');
      }
      const valid = await bcrypt.compare(dto.password, agent.password);
      if (!valid) {
        throw new UnauthorizedException('Identifiants invalides');
      }
      const token = this.jwtService.sign({ email: agent.email, role: agent.role, id: agent.id });
      return { token };
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la connexion');
    }
  }
}
