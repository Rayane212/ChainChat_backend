import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailQueue {
  private queue: Queue;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);    
    this.queue = new Queue('mailQueue', {
      connection: {
        host: host,
        port: port,
      },
    });
  }

  async addMailJob(to: string, subject: string, html: string) {
    await this.queue.add('sendMail', { to, subject, html }, { attempts: 3 });
  }
}