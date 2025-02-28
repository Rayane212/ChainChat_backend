import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rayane:Rayane14102002@localhost:5672'], 
        queue: 'auth_queue',
        queueOptions: {
          durable: true, 
        },
      },
    },
  );
  console.log('✅ AuthService connecté à RabbitMQ, écoute de auth_queue');
  await app.listen();
}
bootstrap();