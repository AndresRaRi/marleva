import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AccountService } from '../../../../account.service.js';
import { fail } from '../../../../security.js';
import { ReadEmailChange } from '../../application/use-cases/read-email-change.js';
@Controller('v1/auth/email-changes')
export class EmailChangeController {
  constructor(
    private readonly accounts: AccountService,
    private readonly read: ReadEmailChange,
  ) {}
  @Get('current')
  async current(@Req() request: Request) {
    const principal = await this.accounts.principal(request);
    if (Object.keys(request.query).length) fail(422, 'CAMPOS', 'La consulta no admite parámetros');
    return this.read.execute(principal.account.id);
  }
}
