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
        await resend.emails.send({
          from: configService.get<string>('EMAIL_FROM'),
          to,
          subject,
          html,
        });

        console.log(`📧 Email envoyé à ${to}`);
      } catch (error) {
        console.error('Erreur envoi email:', error);
        throw new Error('Échec de l’envoi d’email');
      }
    },
    {
      connection: {
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      },
    }
  );
}