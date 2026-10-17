import { Controller, Get } from '@nestjs/common';
import { readiness } from './readiness.js';

@Controller('health')
export class HealthController {
  @Get('live') live() {
    return { status: 'alive' };
  }
  @Get('ready') ready() {
    return readiness();
  }
}
