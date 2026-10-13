import nodemailer from 'nodemailer';
import { config } from '../../../../config.js';
import type { OutboxItem, OutboxMailer } from '../../application/ports/outbox-repository.js';
export class SmtpOutboxMailer implements OutboxMailer {
  private readonly transport;
  constructor() {
    const c = config();
    this.transport = nodemailer.createTransport({
      host: c.SMTP_HOST,
      port: Number(c.SMTP_PORT),
      secure: false,
      connectionTimeout: 3000,
      socketTimeout: 3000,
    });
  }
  async send(item: OutboxItem) {
    if (!/^[^\s@]+@example\.test$/.test(item.recipient)) throw new Error('Local fixtures only');
    await this.transport.sendMail({
      from: 'Marleva local <no-reply@example.test>',
      to: item.recipient,
      subject: item.subject,
      text: item.text,
      messageId: `<${item.id}@marleva.example.test>`,
    });
  }
  close() {
    this.transport.close();
  }
}
