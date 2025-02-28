
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from 'src/user/user.service';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, UserService, RabbitMQService],
  imports: [
    UserModule, 
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'mail',
          protoPath: join(__dirname, '../../proto/mail.proto'),
          url: 'mail_service:50052'
        },
      },
    ]),
  ],
})
export class AuthModule {}
