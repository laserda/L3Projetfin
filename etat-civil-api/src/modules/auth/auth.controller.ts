import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription citoyen' })
  @ApiResponse({ status: 201, description: 'Utilisateur inscrit' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion citoyen' })
  @ApiResponse({ status: 200, description: 'Connexion réussie, retourne un JWT' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login-agent')
  @ApiOperation({ summary: 'Connexion agent administratif' })
  @ApiResponse({ status: 200, description: 'Connexion agent, retourne un JWT' })
  async loginAgent(@Body() dto: LoginDto) {
    return this.authService.loginAgent(dto);
  }
}
