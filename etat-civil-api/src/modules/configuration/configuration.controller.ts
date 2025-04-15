import { Controller, Put, Body } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { UpdateTimbreDto } from './dto/update-timbre.dto';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Put('timbres')
  async updateTimbres(@Body() dto: UpdateTimbreDto) {
    return this.configurationService.updateTimbres(dto);
  }
}
