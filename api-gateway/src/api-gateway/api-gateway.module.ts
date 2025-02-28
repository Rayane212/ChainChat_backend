import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Module({
    imports: [
        ClientsModule.register([
          {
            name: 'MESSAGING_SERVICE',
            transport: Transport.TCP,
            options: {
              host: 'messaging_service',
              port: 3002, 
            },
          },
        ]),
        AuthModule
      ],
      controllers: [ApiGatewayController],
      providers: [JwtService, RabbitMQService],
    })

export class ApiGatewayModule {}
