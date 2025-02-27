// main.ts
import { NestFactory } from '@nestjs/core';
import { MessagingModule } from 'src/messaging/messaging.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Créer une application hybride
  const app = await NestFactory.create(MessagingModule);

  // Configurer le microservice TCP
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: parseInt(process.env.PORT) || 3002,
    },
  });

  // Activer CORS
  app.enableCors({
    origin: '*',
    credentials: true
  });

  // Démarrer les microservices
  await app.startAllMicroservices();
  
  await app.listen(3003); 
}
bootstrap();
