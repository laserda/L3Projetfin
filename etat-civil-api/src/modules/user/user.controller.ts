import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAgentDto } from './dto/create-agent.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe() {
    // À remplacer par l'utilisateur connecté (mock)
    return this.userService.getMe();
  }

  @Post('/agents')
  async createAgent(@Body() dto: CreateAgentDto) {
    return this.userService.createAgent(dto);
  }
}
