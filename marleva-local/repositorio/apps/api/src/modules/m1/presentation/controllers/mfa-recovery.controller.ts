import { Controller, Get, Post, Body, Param, Req, HttpCode } from '@nestjs/common';
import type { Request } from 'express';
import { AccountService } from '../../../../account.service.js';
import { uuid } from '../../../../security.js';
import { RequestMfaRecovery } from '../../application/use-cases/request-mfa-recovery.js';
import { ReadMfaRecovery } from '../../application/use-cases/read-mfa-recovery.js';
import { ReviewMfaRecovery } from '../../application/use-cases/review-mfa-recovery.js';
import { IssueRecoveryCapability } from '../../application/use-cases/issue-recovery-capability.js';
import { EnrollRecoveryFactor } from '../../application/use-cases/enroll-recovery-factor.js';
import { VerifyRecoveryFactor } from '../../application/use-cases/verify-recovery-factor.js';
import { recoveryRequest, recoveryKey, recoveryCapability } from '../dtos/recovery-request.js';
@Controller('v1/auth/mfa-recoveries')
export class MfaRecoveryController {
  constructor(
    private readonly accounts: AccountService,
    private readonly requests: RequestMfaRecovery,
    private readonly reads: ReadMfaRecovery,
    private readonly reviews: ReviewMfaRecovery,
    private readonly capabilities: IssueRecoveryCapability,
    private readonly enrollments: EnrollRecoveryFactor,
    private readonly verifications: VerifyRecoveryFactor,
  ) {}
  private async actor(request: Request, mutation = true) {
    const p = await this.accounts.principal(request, mutation);
    return {
      accountId: p.account.id,
      authId: p.account.authId,
      sessionId: p.session.id,
      authenticatedAt: p.session.authenticatedAt,
      tokens: p.tokens,
    };
  }
  @Post() @HttpCode(202) async request(@Req() r: Request, @Body() body: unknown) {
    const input = recoveryRequest(body, 'request');
    return this.requests.execute(
      await this.actor(r),
      input.reason!,
      recoveryKey(r.headers['idempotency-key']),
    );
  }
  @Get(':id') read(@Req() r: Request, @Param('id') id: string) {
    return this.actor(r, false).then((actor) => this.reads.execute(actor, uuid(id)));
  }
  @Post(':id/approvals') @HttpCode(202) async approve(
    @Req() r: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = recoveryRequest(body, 'version');
    return this.reviews.execute(
      await this.actor(r),
      uuid(id),
      input.version,
      recoveryKey(r.headers['idempotency-key']),
      'approve',
    );
  }
  @Post(':id/rejections') @HttpCode(200) async reject(
    @Req() r: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = recoveryRequest(body, 'reject');
    return this.reviews.execute(
      await this.actor(r),
      uuid(id),
      input.version,
      recoveryKey(r.headers['idempotency-key']),
      'reject',
      input.reason,
    );
  }
  @Post(':id/capabilities') async capability(
    @Req() r: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = recoveryRequest(body, 'version');
    return this.capabilities.execute(
      await this.actor(r),
      uuid(id),
      input.version,
      recoveryKey(r.headers['idempotency-key']),
    );
  }
  @Post(':id/enrollments') async enroll(
    @Req() r: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = recoveryRequest(body, 'version');
    return this.enrollments.execute(
      await this.actor(r),
      uuid(id),
      input.version,
      recoveryKey(r.headers['idempotency-key']),
      recoveryCapability(r.headers['x-recovery-capability']),
    );
  }
  @Post(':id/verifications') async verify(
    @Req() r: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = recoveryRequest(body, 'verify');
    return this.verifications.execute(
      await this.actor(r),
      uuid(id),
      input.version,
      recoveryKey(r.headers['idempotency-key']),
      recoveryCapability(r.headers['x-recovery-capability']),
      input.factorId!,
      input.code!,
    );
  }
}
