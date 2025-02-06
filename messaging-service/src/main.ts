import { NestFactory } from '@nestjs/core';
import { MessagingModule } from 'src/messaging/messaging.module'
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MessagingModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: parseInt(process.env.PORT) || 3002,
      },
    },
  );
  await app.listen();
}
bootstrap();