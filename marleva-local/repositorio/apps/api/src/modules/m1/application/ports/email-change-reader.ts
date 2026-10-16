type EmailChangeSnapshot = {
  id: string;
  accountId: string;
  oldEmail: string;
  newEmail: string;
  oldConfirmed: boolean;
  newConfirmed: boolean;
  state: string;
  expiresAt: Date;
};
export interface EmailChangeReader {
  latest(accountId: string): Promise<EmailChangeSnapshot | null>;
}
