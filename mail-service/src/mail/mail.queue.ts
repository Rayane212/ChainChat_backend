import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailQueue {
  private queue: Queue;

  constructor(private readonly configService: ConfigService) {
    this.queue = new Queue('mailQueue', {
      connection: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
      },
    });
  }

  async addMailJob(to: string, subject: string, html: string) {
    await this.queue.add('sendMail', { to, subject, html }, { attempts: 3 });
  }
}