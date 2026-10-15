import { Controller, Get, Post, Delete, Body, Req, Res, Param } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccountService } from './account.service.js';
import { config } from './config.js';
import { database } from './database.js';
import { fail } from './security.js';
import { accountRequest } from './modules/m1/presentation/dtos/account-request.js';
@Controller('v1')
export class AccountController {
  constructor(private readonly accounts: AccountService) {}
  @Post('auth/challenges') challenges(@Body() b: Record<string, unknown>, @Req() r: Request) {
    return this.accounts.challenge(
      accountRequest(b, ['correo']).correo,
      r.socket.remoteAddress ?? 'unknown',
    );
  }
  @Post('auth/verifications') async verify(
    @Body() b: Record<string, unknown>,
    @Req() r: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const body = accountRequest(b, ['challenge_id', 'codigo']);
    const result = await this.accounts.verify(body.challenge_id, body.codigo);
    if (r.headers['x-marleva-client'] === 'native' && !r.headers.origin)
      return { session_token: result.token, csrf_token: result.csrf, cuenta: result.account };
    if (r.headers.origin !== config().APP_ORIGIN) fail(403, 'ORIGEN', 'Acceso no permitido');
    res.cookie('marleva_session', result.token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 86400000,
    });
    return { csrf_token: result.csrf, cuenta: result.account };
  }
  @Get('me') async me(@Req() r: Request) {
    const p = await this.accounts.principal(r);
    return this.accounts.publicAccount(p.account);
  }
  @Get('auth/csrf') async csrf(@Req() r: Request) {
    return this.accounts.csrf(await this.accounts.principal(r));
  }
  @Delete('auth/sessions/current') async logout(
    @Req() r: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.accounts.logout(await this.accounts.principal(r, true));
    res.clearCookie('marleva_session', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return result;
  }
  @Delete('auth/sessions') async logoutAll(
    @Req() r: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.accounts.logout(await this.accounts.principal(r, true), true);
    res.clearCookie('marleva_session', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
    return result;
  }
  @Post('auth/email-changes') async change(@Req() r: Request, @Body() b: Record<string, unknown>) {
    return this.accounts.emailChange(
      await this.accounts.principal(r, true),
      accountRequest(b, ['correo']).correo,
    );
  }
  @Post('auth/email-changes/:id/confirmations') async confirm(
    @Req() r: Request,
    @Param('id') id: string,
    @Body() b: Record<string, unknown>,
  ) {
    const principal = await this.accounts.principal(r, true);
    const body = accountRequest(b, ['correo', 'codigo']);
    return this.accounts.confirmEmail(principal, id, body.correo, body.codigo);
  }
  @Post('auth/mfa/enrollments') async enroll(@Req() r: Request) {
    return this.accounts.enroll(await this.accounts.principal(r, true));
  }
  @Post('auth/mfa/verifications') async factor(
    @Req() r: Request,
    @Body() b: Record<string, unknown>,
  ) {
    const principal = await this.accounts.principal(r, true);
    const body = accountRequest(b, ['factor_id', 'codigo']);
    return this.accounts.verifyFactor(principal, body.factor_id, body.codigo);
  }
  @Get('operator/access') async operator(@Req() r: Request) {
    return this.accounts.operator(await this.accounts.principal(r));
  }
}
@Controller('health')
export class HealthController {
  @Get('live') live() {
    return { status: 'alive' };
  }
  @Get('ready') async ready() {
    const c = config(),
      db = database();
    try {
      await db.$queryRaw`SELECT 1`;
      const results = await Promise.all([
        fetch(`${c.SUPABASE_URL}/auth/v1/health`, {
          headers: { apikey: c.SUPABASE_ANON_KEY },
          signal: AbortSignal.timeout(3000),
        }),
        fetch(`${c.SUPABASE_URL}/storage/v1/status`, {
          headers: { apikey: c.SUPABASE_ANON_KEY },
          signal: AbortSignal.timeout(3000),
        }),
        fetch(`${c.MAILPIT_URL}/api/v1/info`, { signal: AbortSignal.timeout(3000) }),
      ]);
      if (results.some((r) => !r.ok))
        fail(503, 'DEPENDENCIA', 'Una dependencia local no está disponible');
      return { status: 'ready', mode: 'local', payment: 'simulated' };
    } finally {
      await db.$disconnect();
    }
  }
}
