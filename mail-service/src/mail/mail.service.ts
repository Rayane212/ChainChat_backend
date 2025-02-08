import { Injectable } from '@nestjs/common';
import { MailQueue } from './mail.queue';

@Injectable()
export class MailService {
  constructor(private readonly mailQueue: MailQueue) {}

  async sendMail(to: string, subject: string, html: string) {
    await this.mailQueue.addMailJob(to, subject, html);
    return { success: true, message: 'Email ajouté à la file d’attente' };
  }
}