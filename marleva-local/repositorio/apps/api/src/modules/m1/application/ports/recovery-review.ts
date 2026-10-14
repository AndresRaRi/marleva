export type RecoveryReviewer = {
  accountId: string;
  sessionId: string;
  authenticatedAt: Date;
};
export interface RecoveryReviewPermissions {
  accessAdmin(accountId: string): Promise<boolean>;
  assurance(sessionId: string): Promise<'aal1' | 'aal2'>;
}
