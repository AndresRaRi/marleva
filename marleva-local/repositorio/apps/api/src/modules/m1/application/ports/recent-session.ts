import type { AccountPrincipal } from '../../domain/account-records.js';
export interface RecentSession {
  recent(principal: AccountPrincipal): void;
}
