import { NestFactory } from '@nestjs/core';
import { MessagingModule } from 'src/messaging/messaging.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(MessagingModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'messaging_service',
      port: parseInt(process.env.PORT) || 3002,
    },
  });

  app.enableCors({
    origin: '*',
    credentials: true
  });

  await app.startAllMicroservices();
  
  await app.listen(3003, '0.0.0.0'); 
}
bootstrap();
