import { Worker } from 'bullmq';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

export function createMailWorker(configService: ConfigService) {
  const resend = new Resend(configService.get<string>('RESEND_API_KEY'));

  return new Worker(
    'mailQueue',
    async (job) => {
      const { to, subject, html } = job.data;

      try {
        console.log(`📧 Envoi email à ${to}...`);
        await resend.emails.send({
          from: configService.get<string>('EMAIL_FROM'),
          to,
          subject,
          html,
        });

      } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    },
    {
      connection: {
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
      },
    }
  );
}