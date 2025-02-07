import { Module } from '@nestjs/common';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';
import { PrismaService } from 'src/prisma.service';
import { MessagingController } from './messaging.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Module({
    providers: [MessagingService, PrismaService, JwtService, UserService, MessagingGateway],
    controllers: [MessagingController],
})
export class MessagingModule {}
