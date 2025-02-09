import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { MicroserviceOptions, Server, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { createMailWorker } from './mail/mail.worker';

async function bootstrap() {
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(MailModule, {
      transport: Transport.GRPC,
      options: {
        package: 'mail',
        protoPath: join(__dirname, '../proto/mail.proto'),
        url: '0.0.0.0:50052',
      },
    });

    const configService = app.get(ConfigService);
    
    createMailWorker(configService);

    await app.listen();

  } catch (error) {
    console.error('Error during startup:', error);
    process.exit(1);
  }
}
bootstrap();