import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { createMailWorker } from './mail/mail.worker';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(MailModule, {
    transport: Transport.GRPC,
    options: {
      package: 'mail',
      protoPath: join(__dirname, '../proto/mail.proto'),
    },
  });

  const configService = app.get(ConfigService);
  createMailWorker(configService);

  await app.listen();
  console.log('📧 MailService gRPC en écoute avec Resend...');
}
bootstrap();