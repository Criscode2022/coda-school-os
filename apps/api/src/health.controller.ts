import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  health() {
    return { ok: true, service: 'coda-api', db: this.db.source };
  }
}
