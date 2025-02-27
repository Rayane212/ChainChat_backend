import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ApiGatewayController } from './api-gateway.controller';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        ClientsModule.register([
          {
            name: 'AUTH_SERVICE',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 3001,
            },
          },
          {
            name: 'MESSAGING_SERVICE',
            transport: Transport.TCP,
            options: {
              host: 'localhost',
              port: 3002, 
            },
          },
        ]),
        AuthModule
      ],
      controllers: [ApiGatewayController],
      providers: [JwtService],
    })

export class ApiGatewayModule {}
