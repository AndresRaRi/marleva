export type OutboxItem = {
  id: string;
  recipient: string;
  subject: string;
  text: string;
  createdAt: Date;
  attempts: number;
};
export interface OutboxRepository {
  ready(now: Date): Promise<OutboxItem[]>;
  expire(item: OutboxItem, now: Date): Promise<void>;
  claim(item: OutboxItem, now: Date, lease: Date): Promise<boolean>;
  complete(id: string, lease: Date): Promise<void>;
  retry(id: string, lease: Date, dueAt: Date, expired: boolean): Promise<void>;
}
export interface OutboxMailer {
  send(item: OutboxItem): Promise<void>;
}
