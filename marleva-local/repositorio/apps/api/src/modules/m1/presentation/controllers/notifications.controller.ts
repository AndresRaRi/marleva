import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AccountService } from '../../../../account.service.js';
import { ListNotices } from '../../application/use-cases/list-notices.js';
import { NoticeQuery } from '../dtos/notice-query.js';

@Controller('v1/notifications')
export class NotificationsController {
  constructor(
    private readonly accounts: AccountService,
    private readonly list: ListNotices,
  ) {}

  @Get()
  async page(@Req() request: Request, @Query() query: unknown) {
    const principal = await this.accounts.principal(request);
    const input = NoticeQuery.parse(query, principal.account.id);
    return this.list.execute(principal.account.id, input.limit, input.boundary);
  }
}
