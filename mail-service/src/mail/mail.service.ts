import { Injectable } from '@nestjs/common';
import { MailQueue } from './mail.queue';

@Injectable()
export class MailService {
  constructor(private readonly mailQueue: MailQueue) {}

  async sendMail(data:any) {
    await this.mailQueue.addMailJob(data.to, data.subject, data.html);
    return { success: true, message: 'Email added to queue' };
  }
}