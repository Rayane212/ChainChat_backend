import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Auth Service')
  .setDescription('The Auth Service API description')
  .setVersion('1.0')
  .addTag('auth')
  .addBearerAuth()
  .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const cors = {
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: 'GET, POST, PUT, DELETE, HEAD, PATCH, OPTIONS',
  }
  
  app.enableCors(cors);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
